const https = require('https');

let cachedReviews = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

// Fallback actual reviews in case of network issue
const FALLBACK_REVIEWS = [
  {
    id: "rev-pallavi",
    author: "Pallavi Mishra",
    authorPhoto: "https://lh3.googleusercontent.com/a/ACg8ocK3fb3meHPTCkGU1HMsueDCc_2gPXfRFRHAURXbCSFl4Sl7sA=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    relativeTime: "6 months ago",
    text: "Awesome trip....We had an amazing experience exploring Udaipur, all thanks to our driver, Mr. Heera Lal. He is extremely professional, punctual, and very understanding. Throughout the trip, he was supportive, patient, and always made sure we were comfortable and enjoying every moment. Highly recommended if you’re planning a trip to Udaipur!",
    googleMapsUri: "https://g.page/r/CUj5F0eRuHpFEAE"
  },
  {
    id: "rev-arpit",
    author: "Arpit Pandey",
    authorPhoto: "https://lh3.googleusercontent.com/a-/ALV-UjX-0ekvCB2vB5iHXUBkxy2WzX6Hc5pIFJJtbJQbFFjCYOyrHT1wKA=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    relativeTime: "2 months ago",
    text: "⭐️⭐️⭐️⭐️⭐️ Exceptional Service and an Unforgettable Udaipur! We recently used Yatree Destination for our airport pickup/drop off including city tour, and I cannot recommend them highly enough. From the very first inquiry, Kavish and his team provided seamless, professional, and incredibly reliable service.",
    googleMapsUri: "https://g.page/r/CUj5F0eRuHpFEAE"
  },
  {
    id: "rev-komal",
    author: "Komal Kataria",
    authorPhoto: "https://lh3.googleusercontent.com/a/ACg8ocKg7g6lVBzCSyMjWyV2y52T3q_knC2V8FR1GP3tog_z9HmKMw=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    relativeTime: "2 months ago",
    text: "Yatree Destination provided great service for our trip in Udaipur. The driver was knowledgeable, polite, and guided us with great patience across all locations. Would definitely book again!",
    googleMapsUri: "https://g.page/r/CUj5F0eRuHpFEAE"
  },
  {
    id: "rev-pratik",
    author: "Pratik Kumar",
    authorPhoto: "https://lh3.googleusercontent.com/a-/ALV-UjXigNP51e2gV6qbQP_yT14N5xawvdARviDUpF3nNlJz-lpjscJM=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    relativeTime: "a year ago",
    text: "Had a very good experience with Yatree Destination Private Limited, Udaipur. I am very happy with their service. I visited Udaipur with my wife and 1 year baby. The driver Heeralal was very friendly and took great care of us. Everything went smoothly.",
    googleMapsUri: "https://g.page/r/CUj5F0eRuHpFEAE"
  },
  {
    id: "rev-puja",
    author: "Puja maskara",
    authorPhoto: "https://lh3.googleusercontent.com/a-/ALV-UjXG01sVSrfjdk45pFpnv4lbggRLNLstSt-TSZrTghkwb-Mpx_tP=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    relativeTime: "4 months ago",
    text: "We recently used their cab services for Rajasthan trip. The driver was polite and very helpful. Car was clean. Our journey was totally hassle free. Will surely recommend.",
    googleMapsUri: "https://g.page/r/CUj5F0eRuHpFEAE"
  }
];

function fetchFromGooglePlaces() {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyD0jsulDanDcyj0C7BOPyQsb9S35VgzZaY';
    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJ94ogeR3vZzkRSPkXR5G4ekU';

    const req = https.request({
      hostname: 'places.googleapis.com',
      path: `/v1/places/${placeId}`,
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.reviews && Array.isArray(json.reviews)) {
            const reviews = json.reviews.map(r => ({
              id: r.name || Math.random().toString(),
              author: r.authorAttribution?.displayName || 'Verified Traveler',
              authorPhoto: r.authorAttribution?.photoUri || '',
              authorUri: r.authorAttribution?.uri || '',
              rating: r.rating || 5,
              relativeTime: r.relativePublishTimeDescription || 'recently',
              publishTime: r.publishTime,
              text: r.text?.text || r.originalText?.text || '',
              googleMapsUri: r.googleMapsUri || 'https://g.page/r/CUj5F0eRuHpFEAE'
            }));

            resolve({
              rating: json.rating || 4.9,
              totalReviews: json.userRatingCount || 124,
              reviews: reviews
            });
          } else {
            resolve({
              rating: 4.9,
              totalReviews: 124,
              reviews: FALLBACK_REVIEWS
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

exports.getGoogleReviews = async (req, res) => {
  try {
    const now = Date.now();
    if (cachedReviews && (now - lastFetchTime < CACHE_DURATION_MS)) {
      return res.status(200).json({
        status: 'success',
        source: 'cache',
        data: cachedReviews
      });
    }

    const liveData = await fetchFromGooglePlaces();
    cachedReviews = liveData;
    lastFetchTime = now;

    res.status(200).json({
      status: 'success',
      source: 'live',
      data: cachedReviews
    });
  } catch (err) {
    console.error('Error fetching Google reviews:', err.message);
    res.status(200).json({
      status: 'success',
      source: 'fallback',
      data: {
        rating: 4.9,
        totalReviews: 124,
        reviews: FALLBACK_REVIEWS
      }
    });
  }
};
