import {MapProvider} from './MapProvider';
import {XHRUtils} from '../utils/XHRUtils';
import {CancelablePromise} from '../utils/CancelablePromise';

/**
 * Bing maps tile provider.
 *
 * API Reference
 *  - https://msdn.microsoft.com/en-us/library/bb259689.aspx (Bing Maps Tile System)
 *  - https://msdn.microsoft.com/en-us/library/mt823633.aspx (Directly accessing the Bing Maps tiles)
 *  - https://www.bingmapsportal.com/
 *
 * @param {string} apiKey Bing API key.
 */
export class BingMapsProvider extends MapProvider 
{
	maxZoom = 19;

	/**
	 * Server API access token.
	 *
	 * @type {string}
	 */
	apiKey: string;

	/**
	 * The type of the map used.
	 *
	 * @type {string}
	 */
	type: string;

	/**
	 * Map image tile format, the formats available are:
	 *  - gif: Use GIF image format.
	 *  - jpeg: Use JPEG image format. JPEG format is the default for Road, Aerial and AerialWithLabels imagery.
	 *  - png: Use PNG image format. PNG is the default format for OrdnanceSurvey imagery.
	 *
	 * @type {string}
	 */
	format = 'jpeg';

	/**
	 * Size of the map tiles.
	 *
	 * @type {number}
	 */
	mapSize = 512;

	/**
	 * Tile server subdomain.
	 *
	 * @type {string}
	 */
	subdomain = 't1';

	public constructor(apiKey, type) 
	{
		super();

		this.apiKey = apiKey !== undefined ? apiKey : '';

		this.type = type !== undefined ? type : BingMapsProvider.AERIAL;
	}

	/**
	 * Display an aerial view of the map.
	 *
	 * @type {string}
	 */
	public static AERIAL = 'a';

	/**
	 * Display a road view of the map.
	 *
	 * @type {string}
	 */
	public static ROAD = 'r';

	/**
	 * Display an aerial view of the map with labels.
	 *
	 * @type {string}
	 */
	public static AERIAL_LABELS = 'h';

	/**
	 * Use this value to display a bird's eye (oblique) view of the map.
	 *
	 * @type {string}
	 */
	public static OBLIQUE = 'o';

	/**
	 * Display a bird's eye (oblique) with labels view of the map.
	 *
	 * @type {string}
	 */
	public static OBLIQUE_LABELS = 'b';

	/**
	 * Get the base URL for the map configuration requested.
	 *
	 * Uses the follwing format
	 * http://ecn.{subdomain}.tiles.virtualearth.net/tiles/r{quadkey}.jpeg?g=129&mkt={culture}&shading=hill&stl=H
	 *
	 */
	getMetaData() 
	{
		const self = this;
		const address = 'http://dev.virtualearth.net/REST/V1/Imagery/Metadata/RoadOnDemand?output=json&include=ImageryProviders&key=' + this.apiKey;

		XHRUtils.get(address, function(data) 
		{
			const meta = JSON.parse(data);

			// TODO <FILL METADATA>
		});
	}

	/**
	 * Convert x, y, zoom quadtree to a bing maps specific quadkey.
	 *
	 * Adapted from original C# code at https://msdn.microsoft.com/en-us/library/bb259689.aspx.
	 *
	 * @param {number} x
	 */
	public static quadKey(zoom, x, y) 
	{
		let quad = '';

		for (let i = zoom; i > 0; i--) 
		{
			const mask = 1 << i - 1;
			let cell = 0;

			if ((x & mask) !== 0) 
			{
				cell++;
			}

			if ((y & mask) !== 0) 
			{
				cell += 2;
			}

			quad += cell;
		}

		return quad;
	}

	fetchTile(zoom, x, y) 
	{
		return new CancelablePromise((resolve, reject) => 
		{
			const image = document.createElement('img');
			image.onload = function() 
			{
				resolve(image);
			};
			image.onerror = function() 
			{
				reject();
			};
			image.crossOrigin = 'Anonymous';
			image.src = 'http://ecn.' + this.subdomain + '.tiles.virtualearth.net/tiles/' + this.type + BingMapsProvider.quadKey(zoom, x, y) + '.jpeg?g=1173';
		});
	}
}