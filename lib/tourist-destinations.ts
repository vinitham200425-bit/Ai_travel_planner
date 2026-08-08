export type TouristDestinationOption = {
  name: string;
  label?: string;
};

const INDIA: TouristDestinationOption[] = [
  { name: "Agra", label: "Agra — Taj Mahal, Agra Fort, Mehtab Bagh" },
  { name: "Ajanta Caves", label: "Ajanta Caves — UNESCO Buddhist cave complex" },
  { name: "Alappuzha", label: "Alappuzha (Alleppey) — Backwaters & houseboats" },
  { name: "Amritsar", label: "Amritsar — Golden Temple & Jallianwala Bagh" },
  { name: "Andaman and Nicobar Islands", label: "Andaman & Nicobar Islands — Beaches, diving & islands" },
  { name: "Auli", label: "Auli — Skiing & Himalayan views" },
  { name: "Aurangabad", label: "Aurangabad — Ajanta, Ellora & Bibi Ka Maqbara" },
  { name: "Badami", label: "Badami — Cave temples & heritage" },
  { name: "Bandhavgarh National Park", label: "Bandhavgarh National Park — Tiger safari" },
  { name: "Bengaluru", label: "Bengaluru — Parks, food, nightlife & museums" },
  { name: "Bharatpur", label: "Bharatpur — Keoladeo National Park" },
  { name: "Bhimbetka Rock Shelters", label: "Bhimbetka Rock Shelters — Prehistoric cave art" },
  { name: "Bikaner", label: "Bikaner — Junagarh Fort & desert culture" },
  { name: "Bodh Gaya", label: "Bodh Gaya — Mahabodhi Temple" },
  { name: "Chandigarh", label: "Chandigarh — Rock Garden & Sukhna Lake" },
  { name: "Chennai", label: "Chennai — Marina Beach, temples & culture" },
  { name: "Cherrapunji", label: "Cherrapunji — Waterfalls & living root bridges" },
  { name: "Chidambaram", label: "Chidambaram — Nataraja Temple" },
  { name: "Chikmagalur", label: "Chikmagalur — Coffee estates & hills" },
  { name: "Chitrakoot", label: "Chitrakoot — Pilgrimage & waterfalls" },
  { name: "Coimbatore", label: "Coimbatore — Temples & Western Ghats gateway" },
  { name: "Coorg", label: "Coorg — Coffee, waterfalls & hills" },
  { name: "Coonoor", label: "Coonoor — Nilgiri tea estates & viewpoints" },
  { name: "Dalhousie", label: "Dalhousie — Colonial hill station" },
  { name: "Darjeeling", label: "Darjeeling — Tea gardens & Himalayan views" },
  { name: "Delhi", label: "Delhi — Red Fort, India Gate, Qutub Minar" },
  { name: "Dharamshala", label: "Dharamshala — Monasteries & mountain scenery" },
  { name: "Diu", label: "Diu — Beaches & Portuguese heritage" },
  { name: "Dwarka", label: "Dwarka — Dwarkadhish Temple & coast" },
  { name: "Ellora Caves", label: "Ellora Caves — UNESCO rock-cut temples" },
  { name: "Gangtok", label: "Gangtok — Monasteries & Himalayan views" },
  { name: "Gaya", label: "Gaya — Pilgrimage & Vishnupad Temple" },
  { name: "Goa", label: "Goa — Beaches, churches & nightlife" },
  { name: "Gokarna", label: "Gokarna — Beaches & temples" },
  { name: "Gulmarg", label: "Gulmarg — Snow, gondola & skiing" },
  { name: "Guwahati", label: "Guwahati — Kamakhya Temple & Brahmaputra" },
  { name: "Hampi", label: "Hampi — Vijayanagara ruins & boulder landscapes" },
  { name: "Haridwar", label: "Haridwar — Ganga Aarti & pilgrimage" },
  { name: "Hyderabad", label: "Hyderabad — Charminar, Golconda & food" },
  { name: "Jaipur", label: "Jaipur — Amber Fort, Hawa Mahal & City Palace" },
  { name: "Jaisalmer", label: "Jaisalmer — Golden Fort & desert safari" },
  { name: "Jodhpur", label: "Jodhpur — Mehrangarh Fort & Blue City" },
  { name: "Kabini", label: "Kabini — Wildlife safari & river" },
  { name: "Kanha National Park", label: "Kanha National Park — Wildlife & tiger safari" },
  { name: "Kanyakumari", label: "Kanyakumari — Sunrise, Vivekananda Rock & coast" },
  { name: "Kasauli", label: "Kasauli — Quiet Himalayan hill station" },
  { name: "Kaziranga National Park", label: "Kaziranga National Park — One-horned rhinos" },
  { name: "Khajuraho", label: "Khajuraho — UNESCO temple complex" },
  { name: "Kochi", label: "Kochi — Fort Kochi, backwaters & heritage" },
  { name: "Kodaikanal", label: "Kodaikanal — Lake, viewpoints & pine forests" },
  { name: "Kolkata", label: "Kolkata — Victoria Memorial, food & culture" },
  { name: "Konark", label: "Konark — Sun Temple & coast" },
  { name: "Kovalam", label: "Kovalam — Beaches & lighthouse" },
  { name: "Kumarakom", label: "Kumarakom — Backwaters & bird sanctuary" },
  { name: "Kumbakonam", label: "Kumbakonam — Temple town" },
  { name: "Kutch", label: "Rann of Kutch — White desert & culture" },
  { name: "Ladakh", label: "Ladakh — Monasteries, passes & high-altitude landscapes" },
  { name: "Lakshadweep", label: "Lakshadweep — Lagoons, beaches & diving" },
  { name: "Lonavala", label: "Lonavala — Monsoon hills & caves" },
  { name: "Lucknow", label: "Lucknow — Nawabi heritage & cuisine" },
  { name: "Madurai", label: "Madurai — Meenakshi Amman Temple" },
  { name: "Mahabalipuram", label: "Mahabalipuram — Shore Temple & UNESCO monuments" },
  { name: "Manali", label: "Manali — Mountains, adventure & Solang Valley" },
  { name: "Mangaluru", label: "Mangaluru — Beaches & temples" },
  { name: "Matheran", label: "Matheran — Car-free hill station" },
  { name: "Mathura", label: "Mathura — Krishna pilgrimage" },
  { name: "McLeod Ganj", label: "McLeod Ganj — Tibetan culture & trekking" },
  { name: "Mount Abu", label: "Mount Abu — Rajasthan hill station & Dilwara Temples" },
  { name: "Mumbai", label: "Mumbai — Gateway of India, Marine Drive & culture" },
  { name: "Munnar", label: "Munnar — Tea gardens & Western Ghats" },
  { name: "Mussoorie", label: "Mussoorie — Himalayan hill station" },
  { name: "Mysuru", label: "Mysuru — Mysore Palace & heritage" },
  { name: "Nainital", label: "Nainital — Lake & Himalayan views" },
  { name: "Nashik", label: "Nashik — Vineyards & pilgrimage" },
  { name: "Ooty", label: "Ooty — Nilgiri hills, lake & botanical gardens" },
  { name: "Orchha", label: "Orchha — Palaces, cenotaphs & Betwa River" },
  { name: "Pahalgam", label: "Pahalgam — Kashmir valleys & rivers" },
  { name: "Panchgani", label: "Panchgani — Plateau & hill views" },
  { name: "Patnitop", label: "Patnitop — Meadows & mountain views" },
  { name: "Pondicherry", label: "Pondicherry — French Quarter, beaches & Auroville" },
  { name: "Pune", label: "Pune — Forts, food & culture" },
  { name: "Puri", label: "Puri — Jagannath Temple & beach" },
  { name: "Rameswaram", label: "Rameswaram — Ramanathaswamy Temple & Pamban" },
  { name: "Ranthambore National Park", label: "Ranthambore National Park — Tiger safari" },
  { name: "Rishikesh", label: "Rishikesh — Yoga, Ganga & rafting" },
  { name: "Sanchi", label: "Sanchi — Buddhist stupas" },
  { name: "Shillong", label: "Shillong — Waterfalls, viewpoints & music" },
  { name: "Shimla", label: "Shimla — Colonial hill station & toy train" },
  { name: "Somnath", label: "Somnath — Jyotirlinga temple & coast" },
  { name: "Spiti Valley", label: "Spiti Valley — High-altitude monasteries & landscapes" },
  { name: "Srinagar", label: "Srinagar — Dal Lake, gardens & houseboats" },
  { name: "Sundarbans", label: "Sundarbans — Mangroves & wildlife" },
  { name: "Tawang", label: "Tawang — Monastery & Himalayan scenery" },
  { name: "Thanjavur", label: "Thanjavur — Brihadeeswarar Temple" },
  { name: "Thekkady", label: "Thekkady — Periyar wildlife & spice plantations" },
  { name: "Thiruvananthapuram", label: "Thiruvananthapuram — Padmanabhaswamy Temple & museums" },
  { name: "Tirupati", label: "Tirupati — Tirumala Venkateswara Temple" },
  { name: "Udaipur", label: "Udaipur — Lakes, palaces & old city" },
  { name: "Ujjain", label: "Ujjain — Mahakaleshwar Jyotirlinga" },
  { name: "Valley of Flowers", label: "Valley of Flowers — Himalayan national park" },
  { name: "Varanasi", label: "Varanasi — Ghats, Ganga Aarti & temples" },
  { name: "Varkala", label: "Varkala — Cliff beach & temples" },
  { name: "Velankanni", label: "Velankanni — Basilica & pilgrimage" },
  { name: "Vrindavan", label: "Vrindavan — Krishna temples" },
  { name: "Wayanad", label: "Wayanad — Forests, caves & waterfalls" },
  { name: "Yercaud", label: "Yercaud — Shevaroy Hills & lake" },
  { name: "Ziro Valley", label: "Ziro Valley — Tribal culture & landscapes" }
];

const FRANCE: TouristDestinationOption[] = [
  { name: "Paris" }, { name: "Eiffel Tower" }, { name: "Louvre Museum" },
  { name: "Palace of Versailles" }, { name: "Mont Saint-Michel" },
  { name: "Nice" }, { name: "Cannes" }, { name: "French Riviera" },
  { name: "Marseille" }, { name: "Lyon" }, { name: "Bordeaux" },
  { name: "Strasbourg" }, { name: "Colmar" }, { name: "Annecy" },
  { name: "Chamonix" }, { name: "Provence" }, { name: "Avignon" },
  { name: "Loire Valley" }, { name: "Normandy" }, { name: "Corsica" },
  { name: "Disneyland Paris" }
];

const ITALY: TouristDestinationOption[] = [
  { name: "Rome" }, { name: "Colosseum" }, { name: "Vatican City" },
  { name: "Florence" }, { name: "Venice" }, { name: "Milan" },
  { name: "Amalfi Coast" }, { name: "Cinque Terre" }, { name: "Naples" },
  { name: "Pompeii" }, { name: "Lake Como" }, { name: "Tuscany" },
  { name: "Siena" }, { name: "Verona" }, { name: "Bologna" },
  { name: "Capri" }, { name: "Sorrento" }, { name: "Sicily" },
  { name: "Sardinia" }, { name: "Dolomites" }
];

const JAPAN: TouristDestinationOption[] = [
  { name: "Tokyo" }, { name: "Kyoto" }, { name: "Osaka" },
  { name: "Mount Fuji" }, { name: "Nara" }, { name: "Hiroshima" },
  { name: "Miyajima" }, { name: "Hakone" }, { name: "Nikko" },
  { name: "Kanazawa" }, { name: "Takayama" }, { name: "Shirakawa-go" },
  { name: "Sapporo" }, { name: "Okinawa" }, { name: "Kobe" },
  { name: "Fukuoka" }, { name: "Nagano" }, { name: "Kamakura" }
];

const UAE: TouristDestinationOption[] = [
  { name: "Dubai" }, { name: "Burj Khalifa" }, { name: "Palm Jumeirah" },
  { name: "Dubai Marina" }, { name: "Desert Safari Dubai" },
  { name: "Abu Dhabi" }, { name: "Sheikh Zayed Grand Mosque" },
  { name: "Louvre Abu Dhabi" }, { name: "Ferrari World Abu Dhabi" },
  { name: "Yas Island" }, { name: "Sharjah" }, { name: "Ras Al Khaimah" },
  { name: "Jebel Jais" }, { name: "Fujairah" }
];

const USA: TouristDestinationOption[] = [
  { name: "New York City" }, { name: "Statue of Liberty" },
  { name: "Times Square" }, { name: "Washington, D.C." },
  { name: "Niagara Falls" }, { name: "Orlando" }, { name: "Miami" },
  { name: "Las Vegas" }, { name: "Grand Canyon National Park" },
  { name: "Los Angeles" }, { name: "San Francisco" }, { name: "Yosemite National Park" },
  { name: "Yellowstone National Park" }, { name: "Hawaii" },
  { name: "Honolulu" }, { name: "Chicago" }, { name: "Boston" },
  { name: "New Orleans" }, { name: "Seattle" }, { name: "San Diego" }
];

const UK: TouristDestinationOption[] = [
  { name: "London" }, { name: "Tower of London" }, { name: "Buckingham Palace" },
  { name: "Edinburgh" }, { name: "Scottish Highlands" }, { name: "Isle of Skye" },
  { name: "Stonehenge" }, { name: "Bath" }, { name: "Oxford" }, { name: "Cambridge" },
  { name: "Lake District" }, { name: "York" }, { name: "Liverpool" },
  { name: "Manchester" }, { name: "Cotswolds" }, { name: "Belfast" }
];

const AUSTRALIA: TouristDestinationOption[] = [
  { name: "Sydney" }, { name: "Sydney Opera House" }, { name: "Great Barrier Reef" },
  { name: "Melbourne" }, { name: "Gold Coast" }, { name: "Brisbane" },
  { name: "Cairns" }, { name: "Uluru" }, { name: "Great Ocean Road" },
  { name: "Tasmania" }, { name: "Perth" }, { name: "Blue Mountains" },
  { name: "Whitsunday Islands" }, { name: "Kangaroo Island" }
];

const SINGAPORE: TouristDestinationOption[] = [
  { name: "Marina Bay Sands" }, { name: "Gardens by the Bay" },
  { name: "Sentosa Island" }, { name: "Universal Studios Singapore" },
  { name: "Singapore Zoo" }, { name: "Night Safari" }, { name: "Jewel Changi Airport" },
  { name: "Merlion Park" }, { name: "Chinatown Singapore" },
  { name: "Little India Singapore" }, { name: "Clarke Quay" },
  { name: "Orchard Road" }, { name: "Singapore Botanic Gardens" }
];

const THAILAND: TouristDestinationOption[] = [
  { name: "Bangkok" }, { name: "Grand Palace Bangkok" }, { name: "Phuket" },
  { name: "Krabi" }, { name: "Phi Phi Islands" }, { name: "Chiang Mai" },
  { name: "Chiang Rai" }, { name: "Pattaya" }, { name: "Ayutthaya" },
  { name: "Koh Samui" }, { name: "Koh Phangan" }, { name: "Khao Sok National Park" }
];

const MALAYSIA: TouristDestinationOption[] = [
  { name: "Kuala Lumpur" }, { name: "Petronas Towers" }, { name: "Langkawi" },
  { name: "Penang" }, { name: "George Town" }, { name: "Malacca" },
  { name: "Cameron Highlands" }, { name: "Genting Highlands" },
  { name: "Perhentian Islands" }, { name: "Tioman Island" }, { name: "Kota Kinabalu" }
];

const INDONESIA: TouristDestinationOption[] = [
  { name: "Bali" }, { name: "Ubud" }, { name: "Seminyak" }, { name: "Kuta" },
  { name: "Nusa Penida" }, { name: "Gili Islands" }, { name: "Jakarta" },
  { name: "Yogyakarta" }, { name: "Borobudur" }, { name: "Mount Bromo" },
  { name: "Komodo National Park" }, { name: "Lombok" }
];

const SPAIN: TouristDestinationOption[] = [
  { name: "Barcelona" }, { name: "Sagrada Familia" }, { name: "Madrid" },
  { name: "Seville" }, { name: "Granada" }, { name: "Alhambra" },
  { name: "Valencia" }, { name: "Mallorca" }, { name: "Ibiza" },
  { name: "Tenerife" }, { name: "Cordoba" }, { name: "Toledo" },
  { name: "San Sebastian" }, { name: "Costa del Sol" }
];

const SWITZERLAND: TouristDestinationOption[] = [
  { name: "Zurich" }, { name: "Lucerne" }, { name: "Interlaken" },
  { name: "Jungfraujoch" }, { name: "Grindelwald" }, { name: "Lauterbrunnen" },
  { name: "Zermatt" }, { name: "Matterhorn" }, { name: "Geneva" },
  { name: "Bern" }, { name: "Montreux" }, { name: "Lake Geneva" },
  { name: "St. Moritz" }, { name: "Rhine Falls" }
];

const GERMANY: TouristDestinationOption[] = [
  { name: "Berlin" }, { name: "Munich" }, { name: "Neuschwanstein Castle" },
  { name: "Hamburg" }, { name: "Cologne" }, { name: "Frankfurt" },
  { name: "Black Forest" }, { name: "Heidelberg" }, { name: "Dresden" },
  { name: "Rothenburg ob der Tauber" }, { name: "Bavarian Alps" }
];

const CANADA: TouristDestinationOption[] = [
  { name: "Toronto" }, { name: "Niagara Falls Canada" }, { name: "Vancouver" },
  { name: "Banff National Park" }, { name: "Lake Louise" }, { name: "Jasper National Park" },
  { name: "Montreal" }, { name: "Quebec City" }, { name: "Ottawa" },
  { name: "Whistler" }, { name: "Prince Edward Island" }, { name: "Nova Scotia" }
];

const SOUTH_KOREA: TouristDestinationOption[] = [
  { name: "Seoul" }, { name: "Gyeongbokgung Palace" }, { name: "Busan" },
  { name: "Jeju Island" }, { name: "Gyeongju" }, { name: "Nami Island" },
  { name: "Sokcho" }, { name: "Seoraksan National Park" }
];

const VIETNAM: TouristDestinationOption[] = [
  { name: "Hanoi" }, { name: "Ha Long Bay" }, { name: "Ho Chi Minh City" },
  { name: "Hoi An" }, { name: "Da Nang" }, { name: "Hue" },
  { name: "Ninh Binh" }, { name: "Sapa" }, { name: "Phu Quoc" },
  { name: "Mekong Delta" }
];

const TURKEY: TouristDestinationOption[] = [
  { name: "Istanbul" }, { name: "Hagia Sophia" }, { name: "Cappadocia" },
  { name: "Pamukkale" }, { name: "Antalya" }, { name: "Ephesus" },
  { name: "Bodrum" }, { name: "Izmir" }, { name: "Fethiye" }
];

const GREECE: TouristDestinationOption[] = [
  { name: "Athens" }, { name: "Acropolis of Athens" }, { name: "Santorini" },
  { name: "Mykonos" }, { name: "Crete" }, { name: "Rhodes" },
  { name: "Meteora" }, { name: "Corfu" }, { name: "Delphi" }
];

const EGYPT: TouristDestinationOption[] = [
  { name: "Cairo" }, { name: "Pyramids of Giza" }, { name: "Luxor" },
  { name: "Aswan" }, { name: "Abu Simbel" }, { name: "Alexandria" },
  { name: "Sharm El Sheikh" }, { name: "Hurghada" }, { name: "Nile Cruise" }
];

const SOUTH_AFRICA: TouristDestinationOption[] = [
  { name: "Cape Town" }, { name: "Table Mountain" }, { name: "Kruger National Park" },
  { name: "Johannesburg" }, { name: "Garden Route" }, { name: "Stellenbosch" },
  { name: "Durban" }, { name: "Blyde River Canyon" }
];

const NEW_ZEALAND: TouristDestinationOption[] = [
  { name: "Auckland" }, { name: "Queenstown" }, { name: "Rotorua" },
  { name: "Milford Sound" }, { name: "Wellington" }, { name: "Christchurch" },
  { name: "Lake Tekapo" }, { name: "Franz Josef Glacier" }, { name: "Hobbiton Movie Set" }
];

export const TOURIST_DESTINATIONS_BY_COUNTRY: Record<
  string,
  TouristDestinationOption[]
> = {
  IN: INDIA,
  FR: FRANCE,
  IT: ITALY,
  JP: JAPAN,
  AE: UAE,
  US: USA,
  GB: UK,
  AU: AUSTRALIA,
  SG: SINGAPORE,
  TH: THAILAND,
  MY: MALAYSIA,
  ID: INDONESIA,
  ES: SPAIN,
  CH: SWITZERLAND,
  DE: GERMANY,
  CA: CANADA,
  KR: SOUTH_KOREA,
  VN: VIETNAM,
  TR: TURKEY,
  GR: GREECE,
  EG: EGYPT,
  ZA: SOUTH_AFRICA,
  NZ: NEW_ZEALAND,
};

export function getTouristDestinations(
  countryCode: string
): TouristDestinationOption[] {
  return (
    TOURIST_DESTINATIONS_BY_COUNTRY[
      countryCode.trim().toUpperCase()
    ] ?? []
  );
}