import { PrismaClient, AccommodationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Accommodations
  const accommodations = [
    // London
    { title: "King's College Student Residence", type: AccommodationType.DORM, city: "London", country: "United Kingdom", monthlyRent: 850, distanceToCenterKm: 3.5, amenities: "WiFi, Laundry, Gym, Study Room, 24/7 Security", safetyRating: 5, description: "On-campus student dormitory with single en-suite rooms. Walking distance to King's College London." },
    { title: "Camden Shared Flat", type: AccommodationType.SHARED_APARTMENT, city: "London", country: "United Kingdom", monthlyRent: 650, distanceToCenterKm: 5.0, amenities: "WiFi, Kitchen, Laundry", safetyRating: 4, description: "Shared 3-bedroom flat in Camden. Great transport links. Includes all bills." },
    { title: "Canary Wharf Studio", type: AccommodationType.STUDIO, city: "London", country: "United Kingdom", monthlyRent: 1400, distanceToCenterKm: 7.0, amenities: "WiFi, Gym, Concierge, Laundry, Parking", safetyRating: 5, description: "Modern studio apartment in Canary Wharf. Ideal for young professionals." },
    // Toronto
    { title: "UofT Graduate House", type: AccommodationType.DORM, city: "Toronto", country: "Canada", monthlyRent: 750, distanceToCenterKm: 1.0, amenities: "WiFi, Study Lounge, Laundry, Kitchen", safetyRating: 5, description: "Graduate student residence near University of Toronto campus." },
    { title: "North York Homestay", type: AccommodationType.HOMESTAY, city: "Toronto", country: "Canada", monthlyRent: 900, distanceToCenterKm: 12.0, amenities: "WiFi, Meals Included, Laundry", safetyRating: 4, description: "Warm family homestay in North York. Two meals per day included. Great for new international students." },
    { title: "Downtown Toronto Shared Apartment", type: AccommodationType.SHARED_APARTMENT, city: "Toronto", country: "Canada", monthlyRent: 800, distanceToCenterKm: 2.0, amenities: "WiFi, Gym, Laundry, Rooftop Terrace", safetyRating: 4, description: "Modern shared apartment in downtown Toronto. Close to subway and shopping." },
    // Sydney
    { title: "USyd Village Apartments", type: AccommodationType.DORM, city: "Sydney", country: "Australia", monthlyRent: 550, distanceToCenterKm: 3.0, amenities: "WiFi, Pool, Gym, Study Room, BBQ Area", safetyRating: 5, description: "Student accommodation near University of Sydney. Social events and community atmosphere." },
    { title: "Bondi Beach Hostel (Temporary)", type: AccommodationType.HOSTEL, city: "Sydney", country: "Australia", monthlyRent: 400, distanceToCenterKm: 8.0, amenities: "WiFi, Shared Kitchen, Laundry", safetyRating: 3, description: "Budget-friendly temporary hostel stay near Bondi Beach. Perfect for first 2-4 weeks." },
    // Berlin
    { title: "Mitte Studentenwohnheim", type: AccommodationType.DORM, city: "Berlin", country: "Germany", monthlyRent: 350, distanceToCenterKm: 2.0, amenities: "WiFi, Laundry, Bicycle Storage", safetyRating: 4, description: "Affordable student dormitory in Berlin Mitte. Close to public transport and several universities." },
    { title: "Kreuzberg Shared Flat (WG)", type: AccommodationType.SHARED_APARTMENT, city: "Berlin", country: "Germany", monthlyRent: 450, distanceToCenterKm: 4.0, amenities: "WiFi, Kitchen, Laundry", safetyRating: 4, description: "Classic Berlin Wohngemeinschaft (WG) in vibrant Kreuzberg. Furnished room in shared flat." },
    // New York
    { title: "Manhattan Shared Apartment", type: AccommodationType.SHARED_APARTMENT, city: "New York", country: "United States", monthlyRent: 1200, distanceToCenterKm: 1.0, amenities: "WiFi, Laundry, Elevator", safetyRating: 4, description: "Furnished room in shared apartment in Manhattan. Close to subway lines." },
    { title: "Brooklyn Family Housing", type: AccommodationType.FAMILY_HOUSING, city: "New York", country: "United States", monthlyRent: 2200, distanceToCenterKm: 8.0, amenities: "WiFi, Laundry, Playground, Parking", safetyRating: 4, description: "Family-friendly 2-bedroom apartment in Brooklyn. Good schools nearby." },
    // Dublin
    { title: "Trinity Hall Residence", type: AccommodationType.DORM, city: "Dublin", country: "Ireland", monthlyRent: 700, distanceToCenterKm: 3.0, amenities: "WiFi, Laundry, Study Room, Common Room", safetyRating: 5, description: "Official Trinity College Dublin student residence. Single rooms with shared kitchens." },
    { title: "Dublin City Homestay", type: AccommodationType.HOMESTAY, city: "Dublin", country: "Ireland", monthlyRent: 650, distanceToCenterKm: 5.0, amenities: "WiFi, Meals Included, Laundry", safetyRating: 4, description: "Friendly Irish family homestay. Breakfast and dinner included. Great for cultural immersion." },
    // Melbourne
    { title: "Melbourne Uni College", type: AccommodationType.DORM, city: "Melbourne", country: "Australia", monthlyRent: 500, distanceToCenterKm: 2.0, amenities: "WiFi, Gym, Study Room, Common Kitchen", safetyRating: 5, description: "Residential college affiliated with University of Melbourne. Includes academic support." },
    // Amsterdam
    { title: "Amsterdam Student Hotel", type: AccommodationType.STUDIO, city: "Amsterdam", country: "Netherlands", monthlyRent: 800, distanceToCenterKm: 3.0, amenities: "WiFi, Gym, Bike Rental, Study Room, Laundry", safetyRating: 5, description: "All-inclusive student studio in Amsterdam. Flexible contract terms available." },
  ];

  for (const acc of accommodations) {
    const existing = await prisma.accommodation.findFirst({
      where: { title: acc.title, city: acc.city },
    });
    if (!existing) {
      await prisma.accommodation.create({ data: acc });
    }
  }
  console.log(`  ✓ ${accommodations.length} accommodations seeded`);

  // Transport Guides
  const transportGuides = [
    { city: "London", country: "United Kingdom", systemName: "London Underground (Tube) + Buses", description: "The Tube covers all of Greater London with 11 lines. Buses run 24/7. Use Contactless or Oyster card. Off-peak fares are cheaper.", studentPassName: "18+ Student Oyster Photocard", studentPassCost: 110, monthlyPassCost: 180, currency: "GBP" },
    { city: "Toronto", country: "Canada", systemName: "TTC (Toronto Transit Commission)", description: "Subway, streetcars, and buses across Toronto. One fare covers all modes with free transfers within 2 hours.", studentPassName: "Post-Secondary Student Metropass", studentPassCost: 128, monthlyPassCost: 156, currency: "CAD" },
    { city: "Sydney", country: "Australia", systemName: "Sydney Trains + Buses + Ferries", description: "Integrated network of trains, buses, ferries, and light rail. Use Opal card or contactless payment. Weekly travel cap applies.", studentPassName: "Concession Opal Card", studentPassCost: 50, monthlyPassCost: 160, currency: "AUD" },
    { city: "Berlin", country: "Germany", systemName: "BVG (U-Bahn + S-Bahn + Buses + Trams)", description: "Comprehensive network covering all of Berlin. Tickets are valid across all modes. Semester tickets available for students.", studentPassName: "Semesterticket", studentPassCost: 200, monthlyPassCost: 91, currency: "EUR" },
    { city: "New York", country: "United States", systemName: "MTA Subway + Buses", description: "24/7 subway and bus network. OMNY contactless payment or MetroCard. Free transfers between subway and bus.", studentPassName: "Reduced-Fare MetroCard", studentPassCost: 0, monthlyPassCost: 132, currency: "USD" },
    { city: "Dublin", country: "Ireland", systemName: "Dublin Bus + Luas + DART", description: "Buses, trams (Luas), and commuter rail (DART). Leap Card provides discounted fares across all modes.", studentPassName: "Student Leap Card", studentPassCost: 30, monthlyPassCost: 130, currency: "EUR" },
    { city: "Melbourne", country: "Australia", systemName: "Metro Trains + Trams + Buses", description: "Free tram zone in CBD. Myki card required for all other travel. Concession fares for students.", studentPassName: "Student Myki Pass", studentPassCost: 55, monthlyPassCost: 113, currency: "AUD" },
    { city: "Amsterdam", country: "Netherlands", systemName: "GVB Trams + Metro + Buses", description: "Excellent tram and metro network. Cycling is the most popular mode — dedicated bike lanes everywhere. OV-chipkaart for all public transport.", studentPassName: "Student OV-weekkaart", studentPassCost: 0, monthlyPassCost: 95, currency: "EUR" },
  ];

  for (const guide of transportGuides) {
    const existing = await prisma.transportGuide.findFirst({
      where: { city: guide.city, country: guide.country },
    });
    if (!existing) {
      await prisma.transportGuide.create({ data: guide });
    }
  }
  console.log(`  ✓ ${transportGuides.length} transport guides seeded`);

  // Budget Estimates (monthly costs in USD)
  const budgetData = [
    { city: "London", country: "United Kingdom", items: [
      { category: "RENT", monthlyCostUSD: 1100 }, { category: "FOOD", monthlyCostUSD: 350 }, { category: "TRANSPORT", monthlyCostUSD: 180 }, { category: "UTILITIES", monthlyCostUSD: 120 }, { category: "INSURANCE", monthlyCostUSD: 50 }, { category: "ENTERTAINMENT", monthlyCostUSD: 200 }, { category: "TUITION", monthlyCostUSD: 1800 },
    ]},
    { city: "Toronto", country: "Canada", items: [
      { category: "RENT", monthlyCostUSD: 900 }, { category: "FOOD", monthlyCostUSD: 300 }, { category: "TRANSPORT", monthlyCostUSD: 120 }, { category: "UTILITIES", monthlyCostUSD: 100 }, { category: "INSURANCE", monthlyCostUSD: 40 }, { category: "ENTERTAINMENT", monthlyCostUSD: 180 }, { category: "TUITION", monthlyCostUSD: 1500 },
    ]},
    { city: "Sydney", country: "Australia", items: [
      { category: "RENT", monthlyCostUSD: 950 }, { category: "FOOD", monthlyCostUSD: 320 }, { category: "TRANSPORT", monthlyCostUSD: 110 }, { category: "UTILITIES", monthlyCostUSD: 90 }, { category: "INSURANCE", monthlyCostUSD: 60 }, { category: "ENTERTAINMENT", monthlyCostUSD: 180 }, { category: "TUITION", monthlyCostUSD: 2000 },
    ]},
    { city: "Berlin", country: "Germany", items: [
      { category: "RENT", monthlyCostUSD: 500 }, { category: "FOOD", monthlyCostUSD: 250 }, { category: "TRANSPORT", monthlyCostUSD: 50 }, { category: "UTILITIES", monthlyCostUSD: 100 }, { category: "INSURANCE", monthlyCostUSD: 100 }, { category: "ENTERTAINMENT", monthlyCostUSD: 150 }, { category: "TUITION", monthlyCostUSD: 0 },
    ]},
    { city: "New York", country: "United States", items: [
      { category: "RENT", monthlyCostUSD: 1500 }, { category: "FOOD", monthlyCostUSD: 400 }, { category: "TRANSPORT", monthlyCostUSD: 132 }, { category: "UTILITIES", monthlyCostUSD: 120 }, { category: "INSURANCE", monthlyCostUSD: 80 }, { category: "ENTERTAINMENT", monthlyCostUSD: 250 }, { category: "TUITION", monthlyCostUSD: 2500 },
    ]},
    { city: "Dublin", country: "Ireland", items: [
      { category: "RENT", monthlyCostUSD: 1000 }, { category: "FOOD", monthlyCostUSD: 300 }, { category: "TRANSPORT", monthlyCostUSD: 130 }, { category: "UTILITIES", monthlyCostUSD: 100 }, { category: "INSURANCE", monthlyCostUSD: 50 }, { category: "ENTERTAINMENT", monthlyCostUSD: 180 }, { category: "TUITION", monthlyCostUSD: 1200 },
    ]},
    { city: "Melbourne", country: "Australia", items: [
      { category: "RENT", monthlyCostUSD: 850 }, { category: "FOOD", monthlyCostUSD: 300 }, { category: "TRANSPORT", monthlyCostUSD: 85 }, { category: "UTILITIES", monthlyCostUSD: 90 }, { category: "INSURANCE", monthlyCostUSD: 55 }, { category: "ENTERTAINMENT", monthlyCostUSD: 170 }, { category: "TUITION", monthlyCostUSD: 1800 },
    ]},
    { city: "Amsterdam", country: "Netherlands", items: [
      { category: "RENT", monthlyCostUSD: 800 }, { category: "FOOD", monthlyCostUSD: 280 }, { category: "TRANSPORT", monthlyCostUSD: 60 }, { category: "UTILITIES", monthlyCostUSD: 110 }, { category: "INSURANCE", monthlyCostUSD: 100 }, { category: "ENTERTAINMENT", monthlyCostUSD: 170 }, { category: "TUITION", monthlyCostUSD: 1000 },
    ]},
  ];

  for (const cityData of budgetData) {
    for (const item of cityData.items) {
      await prisma.budgetEstimate.create({
        data: {
          city: cityData.city,
          country: cityData.country,
          category: item.category,
          monthlyCostUSD: item.monthlyCostUSD,
        },
      });
    }
  }
  console.log(`  ✓ Budget estimates seeded for ${budgetData.length} cities`);

  // Community Groups
  const groups = [
    { name: "Indian Students Society London", type: "STUDENT_CLUB", city: "London", country: "United Kingdom", description: "Community for Indian students in London. Events, festivals, academic support.", memberCount: 45 },
    { name: "Nepalese Community Toronto", type: "CULTURAL", city: "Toronto", country: "Canada", description: "Cultural organization celebrating Nepali heritage. Dashain, Tihar celebrations, language classes.", memberCount: 32 },
    { name: "Berlin Tech Professionals Network", type: "PROFESSIONAL", city: "Berlin", country: "Germany", description: "Networking group for South Asian tech professionals in Berlin. Monthly meetups, job referrals.", memberCount: 28 },
    { name: "Sydney South Asian Students Union", type: "STUDENT_CLUB", city: "Sydney", country: "Australia", description: "Multi-university student union. Campus representation, social events, accommodation help.", memberCount: 38 },
    { name: "New York Nepali Professional Network", type: "PROFESSIONAL", city: "New York", country: "United States", description: "Professional network for Nepali expats in NYC. Mentorship, career workshops, networking.", memberCount: 22 },
    { name: "Dublin Indian Graduate Mentoring", type: "MENTORSHIP", city: "Dublin", country: "Ireland", description: "Mentorship program pairing experienced professionals with new Indian graduates in Ireland.", memberCount: 15 },
    { name: "Melbourne Volunteer Hub", type: "VOLUNTEER", city: "Melbourne", country: "Australia", description: "Volunteer opportunities for international students. Gain local experience, meet new people.", memberCount: 19 },
    { name: "Amsterdam Hindi-Dutch Cultural Exchange", type: "CULTURAL", city: "Amsterdam", country: "Netherlands", description: "Language exchange and cultural events. Learn Dutch, practice Hindi, make friends.", memberCount: 12 },
    { name: "Nepali Students Association UK", type: "STUDENT_CLUB", city: "London", country: "United Kingdom", description: "Support network for Nepali students across the UK. Accommodation tips, visa guidance sessions.", memberCount: 25 },
    { name: "TechToronto Mentorship Circle", type: "MENTORSHIP", city: "Toronto", country: "Canada", description: "Tech industry mentorship for newcomers. Resume reviews, interview prep, referrals.", memberCount: 18 },
  ];

  for (const group of groups) {
    await prisma.communityGroup.create({ data: group });
  }
  console.log(`  ✓ ${groups.length} community groups seeded`);

  // Community Events
  const events = [
    { title: "Diwali Celebration 2026", description: "Annual Diwali festival with food, music, and cultural performances.", date: new Date("2026-11-06T18:00:00Z"), location: "Trafalgar Square, London", organizer: "Indian Students Society London" },
    { title: "Career Fair: Tech Jobs in Berlin", description: "Meet employers hiring international tech talent. Bring your CV!", date: new Date("2026-09-15T10:00:00Z"), location: "Berlin Tech Hub, Mitte", organizer: "Berlin Tech Professionals Network" },
    { title: "Nepali New Year 2083 Celebration", description: "Celebrate Nepali New Year with the community. Traditional food and music.", date: new Date("2026-10-29T17:00:00Z"), location: "Nathan Phillips Square, Toronto", organizer: "Nepalese Community Toronto" },
    { title: "International Students Orientation Meetup", description: "New to Sydney? Meet other international students and get campus tips.", date: new Date("2026-08-20T14:00:00Z"), location: "USyd Quad, Sydney", organizer: "Sydney South Asian Students Union" },
    { title: "Resume Workshop & Networking", description: "Professional resume review and networking with industry mentors.", date: new Date("2026-08-15T16:00:00Z"), location: "Constitution Center, Dublin", organizer: "Dublin Indian Graduate Mentoring" },
    { title: "Volunteer Day: Beach Clean-up", description: "Give back to the community. Lunch provided. Great way to meet people!", date: new Date("2026-08-25T09:00:00Z"), location: "St Kilda Beach, Melbourne", organizer: "Melbourne Volunteer Hub" },
  ];

  for (const event of events) {
    await prisma.communityEvent.create({ data: event });
  }
  console.log(`  ✓ ${events.length} community events seeded`);

  // Sample Jobs (clearly labeled as demonstrations)
  // Create a sample employer company for the demo jobs
  const sampleCompany = await prisma.company.findFirst({
    where: { name: "Example Tech Solutions (Sample)" },
  });

  if (!sampleCompany) {
    const sampleEmployer = await prisma.user.findFirst({
      where: { role: "EMPLOYER" },
    });

    let companyId: string;
    if (sampleEmployer) {
      // Use existing company or create one
      const existingCompany = await prisma.company.findUnique({
        where: { userId: sampleEmployer.id },
      });
      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const company = await prisma.company.create({
          data: {
            userId: sampleEmployer.id,
            name: "Example Tech Solutions (Sample)",
            industry: "Technology",
            description: "This is a sample company profile for demonstration purposes only.",
            location: "Toronto, Canada",
          },
        });
        companyId = company.id;
      }
    } else {
      // Skip job seeding if no employer user exists
      console.log("  ⏭ Sample jobs skipped (no employer user found)");
      console.log("✅ Seeding complete!");
      return;
    }

    const sampleJobs = [
      {
        title: "Software Engineer (Sample Listing)",
        description: "This is a sample job listing demonstrating how opportunities will appear once employers begin posting jobs. Real job postings from verified employers will replace this sample.",
        skills: "JavaScript, React, Node.js",
        salaryMin: null,
        salaryMax: null,
        currency: "CAD",
        location: "Toronto, Canada",
        visaSponsorship: true,
        jobType: "FULL_TIME",
      },
      {
        title: "Data Analyst (Sample Listing)",
        description: "This is a sample job listing demonstrating how opportunities will appear once employers begin posting jobs. Experience Required: 1-2 Years. Real postings will replace this sample.",
        skills: "Python, SQL, Data Analysis",
        salaryMin: null,
        salaryMax: null,
        currency: "AUD",
        location: "Melbourne, Australia",
        visaSponsorship: false,
        jobType: "FULL_TIME",
      },
    ];

    for (const job of sampleJobs) {
      await prisma.job.create({ data: { ...job, companyId } });
    }
    console.log(`  ✓ ${sampleJobs.length} sample jobs seeded (clearly labeled)`);
  } else {
    console.log("  ⏭ Sample jobs already exist");
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
