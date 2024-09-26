//TODO: use node version of this after fixing path, this is really bad, it makes network requests
import { find } from "browser-geo-tz/src/find";
import nbc from "nearby-big-cities";

export async function getTzAndNearby(
  lat: number,
  lon: number,
): Promise<string[]> {
  const timeZones = await find(lat, lon);
  const nearbyCities = nbc({ latitude: lat, longitude: lon }, 2);
  return [
    ...timeZones,
    ...nearbyCities.map((city) => city.name),
    ...nearbyCities.map((city) => city.country),
  ];
}
