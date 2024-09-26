"use client";

import React from "react";

import { PostList } from "~/app/_components/helpers/forms/post/postList";
import Collapsible from "~/app/_components/helpers/simple/collapsible";
import ContinueIterator from "~/app/_components/helpers/simple/continueIterator";
import MapPicker, {
  DefaultLocation,
} from "~/app/_components/helpers/subComponents/map/mapPicker";
import { TagPicker } from "~/app/_components/helpers/subComponents/tag/tagPicker";
import { api } from "~/utils/api";

export default function TagSearch() {
  const [continuePoint, setContinuePoint] = React.useState(0);
  const [location, setLocation] = React.useState(DefaultLocation);
  const [locationEnabled, setLocationEnabled] = React.useState(false);
  const [radiusSelection, setRadiusSelection] = React.useState(20);
  const [tags, setTags] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");

  const QueryResults = api.post.naturalSearch.useQuery(
    {
      continuePoint,
      query,
      tags,
      locationLat: locationEnabled ? location.lat : undefined,
      locationLon: locationEnabled ? location.lng : undefined,
      radius: radiusSelection,
    },
    {
      enabled: tags.length > 0 || query.length > 0 || locationEnabled,
      placeholderData: [],
    },
  );

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-center text-4xl font-bold text-gray-800">
          Browse posts
        </h1>
        <br />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <main className="grid grid-cols-[240px_1fr] items-start gap-10">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Filter</h1>
              <div className="grid gap-2">
                <Collapsible
                  openText="Location"
                  closedText="Location"
                  defaultState={true}
                >
                  <div className="flex h-80 flex-col gap-2 border-2 border-green-400">
                    <label htmlFor="locationEnabled">Enable Location</label>
                    <input
                      type="checkbox"
                      id="locationEnabled"
                      checked={locationEnabled}
                      onChange={() => setLocationEnabled(!locationEnabled)}
                    />
                    <label htmlFor="radiuspicker">Search radius</label>
                    <input
                      id="radiuspicker"
                      type="number"
                      value={radiusSelection}
                      onChange={(e) =>
                        setRadiusSelection(Number(e.target.value))
                      }
                    />
                    <MapPicker
                      location={location}
                      setLocation={setLocation}
                      radius={radiusSelection}
                    />
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="grid gap-6 md:gap-8">
              <div className="relative">
                <input
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Search jobs..."
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Collapsible
                openText="Tags"
                closedText="Tags"
                defaultState={true}
              >
                <TagPicker tags={tags} setTags={setTags} />
              </Collapsible>
              <h1 className="text-2xl font-bold">Results</h1>
              <div className="grid gap-6">
                <PostList posts={QueryResults.data} />
              </div>
            </div>
            <ContinueIterator
              count={continuePoint}
              setCount={setContinuePoint}
            />
          </main>
        </div>
      </main>
    </div>
  );
}
