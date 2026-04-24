import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import QualificationCard from "@/components/QualificationCard";
import Section from "@/components/Section";
import { useGetQualificationsQuery } from "@/redux/apis/qualificationApi";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetLevelsQuery } from "@/redux/apis/qualification/qualificationSupportApi";
import { useGetCategoriesQuery } from "@/redux/apis/qualification/qualificationSupportApi";

const Qualifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);

  const filters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    level: searchParams.get("level") || undefined,
    ordering: searchParams.get("ordering") || undefined,
    delivery_mode: searchParams.get("delivery_mode") || undefined,
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.level || filters.ordering || filters.delivery_mode
  );


  const resetFilters = () => {
    setSearchParams({});
    setSearch("");
  };

  const { data, isLoading, isFetching } = useGetQualificationsQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: levelsData} = useGetLevelsQuery({});

  const categories = categoriesData?.data|| [];
  const levels = levelsData?.data || [];


  const results = data?.data?.results ?? [];



  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateFilter("search", debouncedSearch.trim());
    }
  }, [debouncedSearch]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Qualifications" }]} />

      <Section title="Qualifications">
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Browse our active qualifications and find the right course for your role, sector, and progression route.
        </p>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-end gap-3">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search qualifications..."
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <select
              value={filters.category || ""}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filters.level || ""}
              onChange={(event) => updateFilter("level", event.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level.id} value={level.slug}>
                  {level.name}
                </option>
              ))}
            </select>

            <select
              value={filters.ordering || ""}
              onChange={(event) => updateFilter("ordering", event.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sort By</option>
              <option value="-latest">Newest First</option>
              <option value="latest">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Title: A to Z</option>
              <option value="-title">Title: Z to A</option>
            </select>
          </div>
        </div>

        <p className="mb-8 text-right text-sm text-muted-foreground">
          {isFetching ? "Refreshing results..." : `${data?.data?.count ?? 0} qualification(s) found`}
        </p>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((qualification) => (
              <QualificationCard
                key={qualification.id}
                id={qualification.id}
                slug={qualification.slug}
                title={qualification.title}
                category={qualification.category?.name || null}
                level={qualification.level?.name || null}
                duration={qualification.course_duration}
                price={
                  qualification.current_price
                    ? `${qualification.currency || "GBP"}${Number(qualification.current_price).toLocaleString()}`
                    : "Contact us"
                }
                description={qualification.excerpt}
                imageUrl={
                  qualification.featured_image?.card ||
                  qualification.featured_image?.hero_mobile ||
                  qualification.featured_image?.original ||
                  null
                }
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No courses found matching your filters.</p>
            <Link to="/qualifications" className="mt-2 inline-block font-medium text-primary hover:underline">
              View all qualifications
            </Link>
          </div>
        )}
      </Section>

      <CTASection />
    </div>
  );
};

export default Qualifications;
