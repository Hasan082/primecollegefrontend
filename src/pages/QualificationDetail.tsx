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
  QualificationUpsellItem,
  useGetQualificationDetailQuery,
  useGetUpSalesQuery,
} from "@/redux/apis/qualificationApi";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { filterOutSystemBlocks, getRenderableBlocks } from "@/utils/pageBuilder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatMoney = (value: string | number | null | undefined, currency = "GBP") =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateRange = (startAt: string, endAt: string) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} to ${end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const QualificationDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showUpsell, setShowUpsell] = useState(false);

  const { data, isLoading } = useGetQualificationDetailQuery(slug, { skip: !slug });
  const { data: upsellResponse } = useGetUpSalesQuery(slug, { skip: !slug });
  const qualification = data?.data;
  const detailPageSlug = qualification?.detail_page?.slug;
  const detailPagePublished = qualification?.detail_page?.is_published;
  const { data: pageResponse } = useGetPageQuery(detailPageSlug || "", {
    skip: !detailPageSlug,
  });

  const { addItem, isInCart } = useCart();

  const sessionLocations = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; venueAddress: string; sessions: QualificationSession[] }
    >();

    qualification?.upcoming_sessions?.forEach((session) => {
      const key = session.location_name || "Location to be confirmed";
      if (!grouped.has(key)) {
        grouped.set(key, {
          name: key,
          venueAddress: session.venue_address || "",
          sessions: [],
        });
      }

      grouped.get(key)?.sessions.push(session);
    });

    return Array.from(grouped.values());
  }, [qualification?.upcoming_sessions]);

  useEffect(() => {
    if (!qualification?.has_sessions) {
      return;
    }

    const firstLocation = sessionLocations[0];
    if (!firstLocation) {
      setSelectedLocationName("");
      setSelectedSessionId("");
      return;
    }

    setSelectedLocationName((current) =>
      current && sessionLocations.some((location) => location.name === current)
        ? current
        : firstLocation.name,
    );
  }, [qualification?.has_sessions, sessionLocations]);

  const selectedLocation = useMemo(
    () =>
      sessionLocations.find((location) => location.name === selectedLocationName) ||
      sessionLocations[0] ||
      null,
    [selectedLocationName, sessionLocations],
  );

  useEffect(() => {
    if (!qualification?.has_sessions) {
      return;
    }

    if (!selectedLocation?.sessions?.length) {
      setSelectedSessionId("");
      return;
    }

    setSelectedSessionId((current) =>
      current && selectedLocation.sessions.some((session) => session.id === current)
        ? current
        : selectedLocation.sessions[0].id,
    );
  }, [qualification?.has_sessions, selectedLocation]);

  const selectedSession = useMemo(
    () =>
      qualification?.upcoming_sessions.find((session) => session.id === selectedSessionId) ||
      null,
    [qualification?.upcoming_sessions, selectedSessionId],
  );

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
        <h1 className="text-3xl font-bold text-foreground mb-4">Qualification Not Found</h1>
        <p className="text-muted-foreground mb-6">The qualification you requested is not available.</p>
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
    pricingNote: selectedSession ? `Session selected: ${selectedSession.title}` : "",
    priceValue: Number(selectedSession?.effective_price || qualification.current_price || 0),
  };

  const handleAddToCart = () => {
    if (qualification.has_sessions && !selectedSession) {
      return;
    }

    addItem(currentCartItem);

    if ((upsellResponse?.data?.length || 0) > 0) {
      setShowUpsell(true);
      return;
    }
    navigate("/checkout");
  };

  const bodyBlocks = detailPageSlug
    ? filterOutSystemBlocks(getRenderableBlocks(pageResponse?.data, detailPageSlug))
    : [];

  const hasCmsBody = detailPagePublished !== false && bodyBlocks.length > 0;
  const alreadyInCart = isInCart(qualification.slug);

  return (
    <div className="bg-background">
      <section className="relative h-[450px] overflow-hidden md:h-[540px]">
        {heroImage ? (
          <img src={heroImage} alt={qualification.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.95)_0%,hsl(var(--primary)/0.88)_25%,hsl(var(--primary)/0.7)_45%,hsl(var(--primary)/0.45)_65%,hsl(var(--primary)/0.2)_85%,hsl(var(--primary)/0.08)_100%)]" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">
                {qualification.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/90">
                {qualification.short_description}
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-primary-foreground">
                <span className="rounded bg-secondary px-4 py-2 font-bold uppercase text-secondary-foreground">
                  {qualification.category?.name || "Qualification"}
                </span>
                {qualification.level?.name ? (
                  <span className="rounded bg-white/10 px-4 py-2">{qualification.level.name}</span>
                ) : null}
                {qualification.course_duration ? (
                  <span className="rounded bg-white/10 px-4 py-2">{qualification.course_duration}</span>
                ) : null}
                <span className="rounded bg-white/10 px-4 py-2">
                  {formatMoney(
                    selectedSession?.effective_price || qualification.current_price,
                    qualification.currency,
                  )}
                </span>
              </div>

              {qualification.has_sessions && sessionLocations.length > 0 ? (
                <div className="mt-8 grid gap-4 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary-foreground">Location</p>
                    <Select
                      value={selectedLocation?.name || ""}
                      onValueChange={(value) => {
                        setSelectedLocationName(value);
                        setSelectedSessionId("");
                      }}
                    >
                      <SelectTrigger className="border-white/20 bg-white/5 text-primary-foreground">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionLocations.map((location) => (
                          <SelectItem key={location.name} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLocation?.venueAddress ? (
                      <p className="text-xs text-primary-foreground/75">
                        {selectedLocation.venueAddress}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary-foreground">Date</p>
                    <Select
                      value={selectedSessionId}
                      onValueChange={setSelectedSessionId}
                      disabled={!selectedLocation}
                    >
                      <SelectTrigger className="border-white/20 bg-white/5 text-primary-foreground">
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedLocation?.sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {formatDateRange(session.start_at, session.end_at)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={qualification.has_sessions && !selectedSession}
                className="mt-8 rounded-md bg-secondary px-8 py-3 font-semibold text-secondary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enrol Now - {formatMoney(
                  selectedSession?.effective_price || qualification.current_price,
                  qualification.currency,
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumb items={[{ label: "Qualifications", href: "/qualifications" }, { label: qualification.title }]} />

      <section className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Course overview</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailStat label="Awarding body" value={qualification.awarding_body?.name || "Prime College"} />
              <DetailStat label="Delivery mode" value={qualification.delivery_mode?.name || "Flexible"} />
              <DetailStat label="Course duration" value={qualification.course_duration || "Contact us"} />
              <DetailStat
                label="Current fee"
                value={formatMoney(qualification.current_price, qualification.currency)}
              />
            </div>
          </section>

          {qualification.has_sessions && qualification?.upcoming_sessions?.length > 0 ? (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Upcoming sessions</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This qualification uses a session-booking hero. Learners must choose a live session before checkout.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {(selectedLocation?.sessions || qualification.upcoming_sessions).map((session) => {
                  const isSelected = selectedSession?.id === session.id;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`rounded-2xl border p-5 text-left transition ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40"
                        }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{session.title || session.location_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateRange(session.start_at, session.end_at)}
                          </p>
                          {session.location_name ? (
                            <p className="mt-1 text-sm text-muted-foreground">{session.location_name}</p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Session fee</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatMoney(session.effective_price, qualification.currency)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {session.available_seats === null
                              ? "Seats available"
                              : `${session.available_seats} seat(s) remaining`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {hasCmsBody ? (
            <CMSPageRenderer blocks={bodyBlocks} pageSlug={detailPageSlug || slug} />
          ) : (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold text-foreground">About this qualification</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{qualification.short_description}</p>
              {detailPageSlug && detailPagePublished === false ? (
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Detail page content is currently unpublished.
                </p>
              ) : null}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Enrolment</p>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Current price</p>
              <p className="text-4xl font-bold text-primary">
                {formatMoney(selectedSession?.effective_price || qualification.current_price, qualification.currency)}
              </p>
            </div>

            {selectedSession ? (
              <div className="mt-5 rounded-2xl bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">{selectedSession.title || selectedSession.location_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateRange(selectedSession.start_at, selectedSession.end_at)}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
            >
              {alreadyInCart ? "Update basket and continue" : "Add to basket"}
            </button>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {qualification.has_sessions
                ? "If sessions are available, the chosen session will be sent to checkout and enrolment automatically."
                : "This qualification can be added directly to the checkout basket."}
            </p>
          </div>
        </aside>
      </section>

      <CTASection />

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
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
  </div>
);

export default QualificationDetail;
