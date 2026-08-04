// Country/city data for select dropdowns

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Sweden",
  "Denmark",
  "Finland",
  "Norway",
  "Switzerland",
  "Japan",
  "South Korea",
] as const;

export const CITIES: Record<string, string[]> = {
  "United States": ["New York", "Boston", "San Francisco", "Chicago", "Seattle", "Austin", "Los Angeles", "Atlanta"],
  "United Kingdom": ["London", "Manchester", "Edinburgh", "Birmingham", "Glasgow", "Leeds", "Bristol"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
  Germany: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart"],
  Ireland: ["Dublin", "Cork", "Galway", "Limerick"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Hamilton"],
  France: ["Paris", "Lyon", "Toulouse", "Nice", "Lille", "Bordeaux"],
  Singapore: ["Singapore"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Sweden: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
  Denmark: ["Copenhagen", "Aarhus", "Odense"],
  Finland: ["Helsinki", "Tampere", "Turku", "Oulu"],
  Norway: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
  Switzerland: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Sapporo"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu"],
};

export const ACCOMMODATION_TYPES = [
  "DORM",
  "SHARED_APARTMENT",
  "STUDIO",
  "HOMESTAY",
  "HOSTEL",
  "FAMILY_HOUSING",
] as const;

export const ACCOMMODATION_TYPE_LABELS: Record<string, string> = {
  DORM: "Student Dormitory",
  SHARED_APARTMENT: "Shared Apartment",
  STUDIO: "Studio Apartment",
  HOMESTAY: "Homestay",
  HOSTEL: "Hostel",
  FAMILY_HOUSING: "Family Housing",
};

export const ORIGIN_COUNTRIES = ["India", "Nepal"] as const;
