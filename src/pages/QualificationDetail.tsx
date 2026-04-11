import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpsellModal from "@/components/UpsellModal";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useCart } from "@/contexts/CartContext";
import {
  QualificationSession,
  QualificationSessionLocation,
  QualificationUpsellItem,
  useGetQualificationDetailQuery,
  useGetUpSalesQuery,
} from "@/redux/apis/qualificationApi";
import {
  filterOutSystemBlocks,
  getRenderableBlocks,
} from "@/utils/pageBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatMoney = (
  value: string | number | null | undefined,
  currency = "GBP",
) =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateRange = (startAt?: string, endAt?: string) => {
  if (!startAt && !endAt) {
    return "";
  }

  if (!startAt || !endAt) {
    return formatDate(startAt || endAt || "");
  }

  if (formatDate(startAt) === formatDate(endAt)) {
    return formatDate(startAt);
  }

  return `${formatDate(startAt)} to ${formatDate(endAt)}`;
};

const QualificationDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showUpsell, setShowUpsell] = useState(false);

  const { data, isLoading } = useGetQualificationDetailQuery(slug, {
    skip: !slug,
  });
  const { data: upsellResponse } = useGetUpSalesQuery(slug, { skip: !slug });
  const qualification = data?.data;
  const detailPageSlug = qualification?.detail_page?.slug;
  const detailPagePublished = qualification?.detail_page?.is_published;
  const usesSessionBooking =
    qualification?.hero_mode === "session_booking" ||
    qualification?.has_sessions ||
    qualification?.is_session;

  const { addItem, isInCart } = useCart();

  const normalizedUpcomingSessions = useMemo(
    () => qualification?.upcoming_sessions || [],
    [qualification?.upcoming_sessions],
  );

  const sessionLocations = useMemo(() => {
    if (!qualification) {
      return [] as Array<{
        id: string;
        name: string;
        venueAddress: string;
        sessions: QualificationSession[];
      }>;
    }

    if (qualification.session_locations?.length) {
      return qualification.session_locations.map(
        (location: QualificationSessionLocation) => ({
          id: location.id,
          name: location.name || "Location to be confirmed",
          venueAddress: location.venue_address || "",
          sessions: (location.dates || []).map((date) => ({
            id: date.id,
            title: date.label,
            location_name: location.name || "Location to be confirmed",
            venue_address: location.venue_address || "",
            start_at: date.label,
            end_at: date.label,
            available_seats: null,
            effective_price: qualification.current_price,
            is_featured: false,
          })),
        }),
      );
    }

    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        venueAddress: string;
        sessions: QualificationSession[];
      }
    >();

    normalizedUpcomingSessions.forEach((session) => {
      const key = session.location_name || "Location to be confirmed";
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: key,
          venueAddress: session.venue_address || "",
          sessions: [],
        });
      }

      grouped.get(key)?.sessions.push(session);
    });

    return Array.from(grouped.values());
  }, [qualification, normalizedUpcomingSessions]);

  useEffect(() => {
    if (!usesSessionBooking) {
      return;
    }

    if (!sessionLocations.length) {
      setSelectedLocationName("");
      setSelectedSessionId("");
      return;
    }

    setSelectedLocationName((current) =>
      current && sessionLocations.some((location) => location.name === current)
        ? current
        : "",
    );
  }, [sessionLocations, usesSessionBooking]);

  const selectedLocation = useMemo(
    () =>
      sessionLocations.find(
        (location) => location.name === selectedLocationName,
      ) || null,
    [selectedLocationName, sessionLocations],
  );

  useEffect(() => {
    if (!usesSessionBooking) {
      return;
    }

    if (!selectedLocation?.sessions?.length) {
      setSelectedSessionId("");
      return;
    }

    setSelectedSessionId((current) =>
      current &&
      selectedLocation.sessions.some((session) => session.id === current)
        ? current
        : "",
    );
  }, [selectedLocation, usesSessionBooking]);

  const selectedSession = useMemo(
    () =>
      sessionLocations
        .flatMap((location) => location.sessions)
        .find((session) => session.id === selectedSessionId) ||
      normalizedUpcomingSessions.find(
        (session) => session.id === selectedSessionId,
      ) ||
      null,
    [normalizedUpcomingSessions, selectedSessionId, sessionLocations],
  );

  const hasSessionDates = sessionLocations.some(
    (location) => location.sessions.length > 0,
  );
  const enrolmentDisabled = usesSessionBooking && !selectedSession;
  const disabledMessage = sessionLocations.length
    ? "No available dates for the selected location yet."
    : "No available dates for this course yet.";
  // TODO: need to work here convert to srcset
  const heroImage =
    qualification?.featured_image?.hero_desktop ||
    qualification?.featured_image?.hero_tablet ||
    qualification?.featured_image?.hero_mobile ||
    qualification?.featured_image?.original ||
    "";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!qualification) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Qualification Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          The qualification you requested is not available.
        </p>
        <Link
          to="/qualifications"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          View all qualifications
        </Link>
      </div>
    );
  }

  const currentCartItem = {
    id: qualification.id,
    qualificationId: qualification.id,
    slug: qualification.slug,
    title: qualification.title,
    level: qualification.level?.name || null,
    duration: qualification.course_duration,
    price: formatMoney(
      selectedSession?.effective_price || qualification.current_price,
      qualification.currency,
    ),
    currency: qualification.currency,
    category: qualification.category?.name || null,
    imageUrl:
      qualification.featured_image?.card ||
      qualification.featured_image?.hero_mobile ||
      qualification.featured_image?.original ||
      null,
    qualificationSessionId: selectedSession?.id || null,
    qualificationSessionTitle: selectedSession?.title || null,
    isUpsell: false,
    pricingNote: selectedSession
      ? `Session selected: ${selectedSession.title}`
      : "",
    priceValue: Number(
      selectedSession?.effective_price || qualification.current_price || 0,
    ),
  };

  const handleAddToCart = () => {
    if (usesSessionBooking && !selectedSession) {
      return;
    }

    addItem(currentCartItem);

    if ((upsellResponse?.data?.length || 0) > 0) {
      setShowUpsell(true);
      return;
    }
    navigate("/checkout");
  };

  const bodyBlocks = qualification
    ? filterOutSystemBlocks(
        getRenderableBlocks(
          qualification.body_blocks ?? [],
          detailPageSlug || slug,
        ),
      )
    : [];

  const hasCmsBody = detailPagePublished !== false && bodyBlocks.length > 0;
  const alreadyInCart = isInCart(qualification.slug);

  return (
    <div className="bg-background">
      <section className="relative min-h-[80vh] md:h-[500px] overflow-hidden md:h-[620px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={qualification.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.95)_0%,hsl(var(--primary)/0.88)_25%,hsl(var(--primary)/0.7)_45%,hsl(var(--primary)/0.45)_65%,hsl(var(--primary)/0.2)_85%,hsl(var(--primary)/0.08)_100%)]" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="max-w-3xl text-4xl font-bold leading-[0.95] text-primary-foreground md:text-5xl">
                {qualification.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/90">
                {qualification.short_description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm text-primary-foreground">
                <span className="rounded bg-secondary px-4 py-2 font-bold uppercase text-secondary-foreground">
                  {qualification.category?.name || "Qualification"}
                </span>
                {qualification.level?.name ? (
                  <span className="rounded bg-white/10 px-4 py-2">
                    {qualification.level.name}
                  </span>
                ) : null}
                {qualification.course_duration ? (
                  <span className="rounded bg-white/10 px-4 py-2">
                    {qualification.course_duration}
                  </span>
                ) : null}
                <span className="rounded bg-white/10 px-4 py-2">
                  {formatMoney(
                    selectedSession?.effective_price ||
                      qualification.current_price,
                    qualification.currency,
                  )}
                </span>
              </div>

              {usesSessionBooking ? (
                <div className="mt-8 max-w-[860px]">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                    <div className="space-y-2">
                      <Select
                        value={selectedLocation?.name || ""}
                        onValueChange={(value) => {
                          setSelectedLocationName(value);
                          setSelectedSessionId("");
                        }}
                        disabled={sessionLocations.length === 0}
                      >
                        <SelectTrigger className="h-12 rounded-none border-white/60 bg-white px-4 text-left text-sm text-slate-900 data-[placeholder]:text-slate-500">
                          <SelectValue
                            placeholder={
                              sessionLocations.length
                                ? "Location"
                                : "No locations available"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white text-slate-900">
                          {sessionLocations.map((location) => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={selectedSessionId}
                        onValueChange={setSelectedSessionId}
                        disabled={
                          !selectedLocation || !selectedLocation.sessions.length
                        }
                      >
                        <SelectTrigger className="h-12 rounded-none border-white/60 bg-white px-4 text-left text-sm text-slate-900 data-[placeholder]:text-slate-500">
                          <SelectValue
                            placeholder={
                              hasSessionDates ? "Date" : "No dates available"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white text-slate-900">
                          {selectedLocation?.sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {formatDateRange(
                                session.start_at,
                                session.end_at,
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex w-full md:w-auto">
                            <button
                              type="button"
                              onClick={handleAddToCart}
                              disabled={enrolmentDisabled}
                              aria-label={
                                enrolmentDisabled ? disabledMessage : undefined
                              }
                              className="h-12 w-full rounded-none bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-secondary/60 disabled:text-secondary-foreground/80 md:min-w-[210px]"
                            >
                              Enrol Now -{" "}
                              {formatMoney(
                                selectedSession?.effective_price ||
                                  qualification.current_price,
                                qualification.currency,
                              )}
                            </button>
                          </span>
                        </TooltipTrigger>
                        {enrolmentDisabled ? (
                          <TooltipContent className="max-w-xs border-amber-200 bg-amber-50 text-amber-950">
                            {disabledMessage}
                          </TooltipContent>
                        ) : null}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="mt-8 rounded-xl bg-secondary px-8 py-4 text-base font-semibold text-secondary-foreground transition hover:opacity-90"
                >
                  Enrol Now -{" "}
                  {formatMoney(
                    selectedSession?.effective_price ||
                      qualification.current_price,
                    qualification.currency,
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* <CTASection /> */}

      {showUpsell && upsellResponse?.data?.length ? (
        <UpsellModal
          currentItem={currentCartItem}
          recommendations={upsellResponse.data as QualificationUpsellItem[]}
          onClose={() => setShowUpsell(false)}
        />
      ) : null}
    </div>
  );
};

const DetailStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-muted/30 p-4">
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
  </div>
);

export default QualificationDetail;
