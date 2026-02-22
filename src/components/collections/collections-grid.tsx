"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Types
export interface CollectionData {
  title: string;
  bgColor: string;
  bgImage: string;
  image: string;
}

interface CollectionCardProps {
  collection: CollectionData;
}

const CollectionCard = ({ collection }: CollectionCardProps) => (
  <div
    className={`aspect-[4/5] p-3 ${collection.bgColor} overflow-hidden flex flex-col items-start gap-4 relative rounded-xl cursor-pointer transition-transform hover:scale-105`}
  >
    <img
      className="absolute inset-0 w-full h-full"
      alt="Background"
      src={collection.bgImage}
    />
    <img
      className="absolute inset-0 w-full h-full object-cover"
      alt={collection.title}
      src={collection.image}
    />
    <p className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-sm tracking-[-0.4px] leading-5 z-10">
      {collection.title}
    </p>
  </div>
);

interface CollectionsGridProps {
  collections: CollectionData[];
  showTitle?: boolean;
  columns?: number;
}

export const CollectionsGrid = ({
  collections,
  showTitle = true,
  columns = 6,
}: CollectionsGridProps) => {
  const gridColsClass = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
  }[columns] || "grid-cols-6";

  return (
    <Card className="w-full bg-white rounded-xl shadow-sm">
      <CardContent className="p-4 flex flex-col items-start gap-3">
        {showTitle && (
          <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.5px] leading-5">
            Collections
          </p>
        )}
        <div className={`grid ${gridColsClass} gap-3 w-full`}>
          {collections.map((collection, index) => (
            <CollectionCard key={index} collection={collection} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
