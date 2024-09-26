declare module "nearby-big-cities" {
  export default function (
    coordinates: { latitude: number; longitude: number },
    maxResults?: number,
    maxDistance?: number,
  ): {
    name: string;
    country: string;
    muni: string;
    population: number;
    lat: number;
    lon: number;
  }[];
}
