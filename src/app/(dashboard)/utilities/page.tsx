"use client";

import React, { JSX, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Service } from "@/types/api.types";

type ServiceWithGroup = Service & { group_type?: string };

// Base static cards — visual templates only
const STATIC_CARDS = [
  { title: "Electricity",      groupType: "Electricity",      bgColor: "bg-[#e5c319]", bgImage: "/bg-2.svg", image: "/image.png" },
  { title: "Water",            groupType: "Water",            bgColor: "bg-[#00cccc]", bgImage: "/bg-1.svg", image: "/image-1.png" },
  { title: "Funding",          groupType: "Funding",          bgColor: "bg-[#a789e3]", bgImage: "/bg-4.svg", image: "/icon.png" },
  { title: "Internet",         groupType: "Internet",         bgColor: "bg-[#e9a681]", bgImage: "/bg-3.svg", image: "/icon-1.png" },
  { title: "Security",         groupType: "Security",         bgColor: "bg-[#0088cc]", bgImage: "/bg.svg",   image: "/icon-2.png" },
  { title: "Waste Management", groupType: "Waste Management", bgColor: "bg-[#004466]", bgImage: "/bg-5.svg", image: "/image-2.png" },
];

// Similarity matching: exact → substring → shared words
function findMatchingCardIndex(
  apiGroupType: string,
  cards: typeof STATIC_CARDS,
  usedIndices: Set<number>
): number {
  const a = apiGroupType.toLowerCase().trim();

  // 1. Exact match
  let idx = cards.findIndex(
    (c, i) => !usedIndices.has(i) && c.groupType.toLowerCase() === a
  );
  if (idx !== -1) return idx;

  // 2. Substring match (either direction)
  idx = cards.findIndex(
    (c, i) =>
      !usedIndices.has(i) &&
      (a.includes(c.groupType.toLowerCase()) ||
        c.groupType.toLowerCase().includes(a))
  );
  if (idx !== -1) return idx;

  // 3. Any shared word
  const apiWords = a.split(/\s+/);
  idx = cards.findIndex((c, i) => {
    if (usedIndices.has(i)) return false;
    const cardWords = c.groupType.toLowerCase().split(/\s+/);
    return apiWords.some((w) => w.length > 2 && cardWords.includes(w));
  });

  return idx; // -1 = no match
}

type DisplayCard = {
  title: string;
  bgColor: string;
  bgImage: string;
  image: string;
  apiGroupType: string; // actual API key for service lookup
};

export default function UtilitiesPage(): JSX.Element {
  const { data: services, isLoading } = useServices();
  const [selectedGroup, setSelectedGroup] = useState<{
    title: string;
    services: ServiceWithGroup[];
  } | null>(null);

  // Group API services by group_type
  const servicesByGroup = useMemo(() => {
    return (services as ServiceWithGroup[] || []).reduce<
      Record<string, ServiceWithGroup[]>
    >((acc, s) => {
      const gt = s.group_type || "";
      if (!acc[gt]) acc[gt] = [];
      acc[gt].push(s);
      return acc;
    }, {});
  }, [services]);

  // Build display cards by mapping API group_types onto static card slots
  const displayCards: DisplayCard[] = useMemo(() => {
    const result: DisplayCard[] = STATIC_CARDS.map((c) => ({
      title: c.title,
      bgColor: c.bgColor,
      bgImage: c.bgImage,
      image: c.image,
      apiGroupType: "", // empty = no API data mapped yet
    }));

    const usedIndices = new Set<number>();
    const unmatchedGroups: string[] = [];

    const apiGroupTypes = Object.keys(servicesByGroup);

    // First pass: match API groups to static cards
    for (const gt of apiGroupTypes) {
      const idx = findMatchingCardIndex(gt, STATIC_CARDS, usedIndices);
      if (idx !== -1) {
        result[idx].apiGroupType = gt;
        usedIndices.add(idx);
      } else {
        unmatchedGroups.push(gt);
      }
    }

    // Second pass: unmatched API groups replace unused static card slots
    const unusedIndices = result
      .map((_, i) => i)
      .filter((i) => !usedIndices.has(i));

    unmatchedGroups.forEach((gt, i) => {
      if (i >= unusedIndices.length) return;
      const slot = unusedIndices[i];
      result[slot].title = gt;       // show the API group_type as title
      result[slot].apiGroupType = gt;
    });

    return result;
  }, [servicesByGroup]);

  const handleCardClick = (card: DisplayCard) => {
    if (!card.apiGroupType) return;
    setSelectedGroup({
      title: card.title,
      services: servicesByGroup[card.apiGroupType] || [],
    });
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <section className="flex flex-col items-center gap-4 w-full max-w-[1600px] mx-auto">
        {/* Page Header */}
        <nav className="flex flex-col justify-center px-2 py-2 w-full">
          <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-xl tracking-[-0.8px] leading-7 font-normal">
            Utilities
          </h1>
          <div className="flex items-center gap-2">
            <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] text-xs tracking-[-0.5px] leading-4 font-normal">
              Dashboard
            </span>
            <img className="w-px h-3 object-cover" alt="Divider" src="/divider.svg" />
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-xs tracking-[-0.5px] leading-4">
              Utilities
            </span>
          </div>
        </nav>

        {/* Cards Grid */}
        <Card className="w-full bg-white rounded-xl shadow-sm">
          <CardContent className="p-4 flex flex-col items-start gap-3">
            <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5">
              Collections
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 className="w-6 h-6 text-[#1f1f3f] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3 w-full">
                {displayCards.map((card) => {
                  const isActive = !!card.apiGroupType;
                  return (
                    <div
                      key={card.title}
                      onClick={() => handleCardClick(card)}
                      className={`aspect-[4/5] p-3 ${card.bgColor} overflow-hidden flex flex-col items-start gap-4 relative rounded-xl transition-transform ${
                        isActive
                          ? "cursor-pointer hover:scale-105"
                          : "opacity-40 grayscale cursor-not-allowed"
                      }`}
                    >
                      <img
                        className="absolute inset-0 w-full h-full"
                        alt="Background"
                        src={card.bgImage}
                      />
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={card.title}
                        src={card.image}
                      />
                      <p className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm tracking-[-0.4px] leading-5 z-10">
                        {card.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Detail Modal */}
        <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="sm:max-w-[480px] bg-white">
            <DialogHeader>
              <DialogTitle className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-lg tracking-[-0.8px]">
                {selectedGroup?.title} Services
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              {(selectedGroup?.services || []).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f4f4f9]"
                >
                  {s.logoUrl ? (
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#e5e5ea] flex-shrink-0" />
                  )}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-sm tracking-[-0.5px]">
                      {s.name}
                    </span>
                    {s.description && (
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-xs tracking-[-0.4px]">
                        {s.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
