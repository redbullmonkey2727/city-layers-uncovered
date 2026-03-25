/** A curated list of interesting US cities for the "random" feature */
export const randomCities = [
  "Savannah, Georgia",
  "Asheville, North Carolina",
  "Santa Fe, New Mexico",
  "Charleston, South Carolina",
  "Duluth, Minnesota",
  "Boise, Idaho",
  "Tucson, Arizona",
  "Burlington, Vermont",
  "Chattanooga, Tennessee",
  "Bend, Oregon",
  "Key West, Florida",
  "Taos, New Mexico",
  "Galveston, Texas",
  "Missoula, Montana",
  "Fredericksburg, Virginia",
  "Traverse City, Michigan",
  "Eureka Springs, Arkansas",
  "Deadwood, South Dakota",
  "Tombstone, Arizona",
  "Sedona, Arizona",
  "Bar Harbor, Maine",
  "St. Augustine, Florida",
  "Natchez, Mississippi",
  "Virginia City, Nevada",
  "Mackinac Island, Michigan",
  "Juneau, Alaska",
  "Helena, Montana",
  "Annapolis, Maryland",
  "Lexington, Kentucky",
  "Mobile, Alabama",
];

export function getRandomCity(): string {
  return randomCities[Math.floor(Math.random() * randomCities.length)];
}
