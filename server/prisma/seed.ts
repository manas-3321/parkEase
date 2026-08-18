import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.parkingImage.deleteMany();
  await prisma.parkingSpace.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Create Users (Drivers, Owner, Admin)
  const driver1 = await prisma.user.create({
    data: {
      email: 'demo.driver@parkease.com',
      name: 'Rohan Sharma',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'priya.v@parkease.com',
      name: 'Priya Verma',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'karan.m@parkease.com',
      name: 'Karan Malhotra',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const driver4 = await prisma.user.create({
    data: {
      email: 'neha.g@parkease.com',
      name: 'Neha Gupta',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const driver5 = await prisma.user.create({
    data: {
      email: 'vikram.s@parkease.com',
      name: 'Vikram Singh',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const driver6 = await prisma.user.create({
    data: {
      email: 'ananya.r@parkease.com',
      name: 'Ananya Rao',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'demo.owner@parkease.com',
      name: 'Amit Patel',
      password: passwordHash,
      role: 'OWNER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@parkease.com',
      name: 'ParkEase Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Users seeded successfully:', { driver: driver1.email, owner: owner.email, admin: admin.email });

  // 2. Create Events (Near ABES Engineering College, Lat: 28.6360, Lng: 77.4475)
  const techFest = await prisma.event.create({
    data: {
      name: 'ABES College Annual Tech Fest',
      location: 'ABES Campus Auditorium',
      latitude: 28.6360,
      longitude: 77.4475,
      startTime: new Date(Date.now() - 3600000 * 2), // Started 2 hours ago
      endTime: new Date(Date.now() + 3600000 * 8),   // Ending in 8 hours
      estimatedDemand: 'VERY_HIGH',
      demandReductionPercentage: 75.0, // 75% reduction in available parking capacity nearby
    },
  });

  const concert = await prisma.event.create({
    data: {
      name: 'Vijay Nagar Live Music Night',
      location: 'Vijay Nagar Community Ground',
      latitude: 28.6410,
      longitude: 77.4390,
      startTime: new Date(Date.now() + 3600000 * 24), // Starts tomorrow
      endTime: new Date(Date.now() + 3600000 * 30),
      estimatedDemand: 'HIGH',
      demandReductionPercentage: 50.0,
    },
  });

  console.log('Events seeded successfully');

  // 3. Create Parking Spaces
  // Space 1: ABES Residential Driveway (Very close, Verified, Good score)
  const space1 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'ABES Front Gate Driveway',
      description: 'Secured residential driveway right across the ABES front gate. Ideal for hatchback and sedans.',
      address: 'Plot 42, Sector 11, Lal Kuan, Ghaziabad, UP',
      latitude: 28.6365,
      longitude: 77.4485,
      pricePerHour: 40.0,
      capacity: 2,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 94,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Standard Car)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space1.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  await prisma.verification.create({
    data: {
      parkingSpaceId: space1.id,
      status: 'VERIFIED',
      confidence: 94.0,
      details: JSON.stringify({
        parkingAreaDetected: 'YES',
        imageRelevance: 'HIGH',
        spaceAssessment: 'SUFFICIENT_FOR_SEDAN',
        potentialIssues: 'NONE',
      }),
    },
  });

  // Space 2: NH-24 Commercial Lot (Medium Distance, Verified, Good Score, Dynamic pricing recommendation)
  const space2 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'NH-24 Commercial Safe Lot',
      description: 'Fully guarded office basement parking space located on NH-24. CCTV operational 24/7.',
      address: 'Pinnacle Tower, Sector 62 Link Road, Ghaziabad',
      latitude: 28.6340,
      longitude: 77.4430,
      pricePerHour: 60.0,
      capacity: 5,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 91,
      availabilityStatus: 'AVAILABLE',
      dimensions: '20 x 10 ft (Large SUV)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space2.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  await prisma.verification.create({
    data: {
      parkingSpaceId: space2.id,
      status: 'VERIFIED',
      confidence: 91.0,
      details: JSON.stringify({
        parkingAreaDetected: 'YES',
        imageRelevance: 'HIGH',
        spaceAssessment: 'SUFFICIENT_FOR_SUV',
        potentialIssues: 'NONE',
      }),
    },
  });

  // Space 3: Crossings Republik Covered Garage (Further away, high rating, Verified)
  const space3 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Crossings Republik Basement Garage',
      description: 'Private parking slot in a luxury society basement. Lift access available.',
      address: 'A-102, Paramount Symphony, Crossings Republik, Ghaziabad',
      latitude: 28.6290,
      longitude: 77.4520,
      pricePerHour: 30.0,
      capacity: 1,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 89,
      availabilityStatus: 'AVAILABLE',
      dimensions: '19 x 9.5 ft (Covered Sedan)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space3.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  await prisma.verification.create({
    data: {
      parkingSpaceId: space3.id,
      status: 'VERIFIED',
      confidence: 89.0,
      details: JSON.stringify({
        parkingAreaDetected: 'YES',
        imageRelevance: 'HIGH',
        spaceAssessment: 'SUFFICIENT_FOR_SEDAN',
        potentialIssues: 'NONE',
      }),
    },
  });

  // Space 4: Lal Kuan Two-Wheeler Hub (Very cheap, Two-Wheeler only, verified)
  const space4 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Lal Kuan Quick Bike Park',
      description: 'Convenient paved plot specifically designated for two-wheelers. Safe and gated.',
      address: 'Gali 3, Lal Kuan Chowk, Ghaziabad',
      latitude: 28.6380,
      longitude: 77.4560,
      pricePerHour: 15.0,
      capacity: 10,
      vehicleType: 'TWO_WHEELER',
      status: 'VERIFIED',
      verificationScore: 96,
      availabilityStatus: 'AVAILABLE',
      dimensions: '10 x 5 ft (Two-Wheeler)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space4.id,
      url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  await prisma.verification.create({
    data: {
      parkingSpaceId: space4.id,
      status: 'VERIFIED',
      confidence: 96.0,
      details: JSON.stringify({
        parkingAreaDetected: 'YES',
        imageRelevance: 'HIGH',
        spaceAssessment: 'SUFFICIENT_FOR_MULTIPLE_BIKES',
        potentialIssues: 'NONE',
      }),
    },
  });

  // Space 5: Vijay Nagar Residential Courtyard
  const space5 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Vijay Nagar Residential Courtyard',
      description: 'Large open courtyard suitable for parking. Gated residential property.',
      address: 'H.No 124, Sector 9, Vijay Nagar, Ghaziabad',
      latitude: 28.6400,
      longitude: 77.4420,
      pricePerHour: 35.0,
      capacity: 3,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 92,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Gated Yard)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space5.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 6: Indirapuram Habitat Centre Bay
  const space6 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Indirapuram Habitat Centre Reserved Bay',
      description: 'Covered visitor parking slot near Habitat Centre & Shipra Mall. 24/7 CCTV & Security Guard.',
      address: 'Ahinsa Khand 1, Indirapuram, Ghaziabad',
      latitude: 28.6360,
      longitude: 77.3710,
      pricePerHour: 45.0,
      capacity: 4,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 95,
      availabilityStatus: 'AVAILABLE',
      dimensions: '20 x 10 ft (Covered SUV Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space6.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 7: Vaishali Metro Station Safe Park
  const space7 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Vaishali Metro Station Express Park',
      description: 'Prime parking spot right next to Vaishali Blue Line Metro station. Perfect for daily metro commuters.',
      address: 'Sector 4, Vaishali, Ghaziabad',
      latitude: 28.6490,
      longitude: 77.3400,
      pricePerHour: 50.0,
      capacity: 8,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 97,
      availabilityStatus: 'AVAILABLE',
      dimensions: '19 x 9 ft (Metro Commuter Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space7.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 8: Vasundhara Sector 10 Open Yard
  const space8 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Vasundhara Sector 10 Paved Spot',
      description: 'Spacious paved parking space in Vasundhara residential block. Wide entry gate.',
      address: 'Sector 10, Vasundhara, Ghaziabad',
      latitude: 28.6600,
      longitude: 77.3750,
      pricePerHour: 30.0,
      capacity: 3,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 90,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Sedan Friendly)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space8.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 9: Raj Nagar Extension VVIP Heights Bay
  const space9 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Raj Nagar Extension VVIP Basement',
      description: 'Underground basement parking with auto-gate access card. Located in Raj Nagar Extension.',
      address: 'VVIP Addresses, Raj Nagar Extension, Ghaziabad',
      latitude: 28.6920,
      longitude: 77.4420,
      pricePerHour: 35.0,
      capacity: 2,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 93,
      availabilityStatus: 'AVAILABLE',
      dimensions: '21 x 10 ft (Premium Basement Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space9.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 10: Kavi Nagar Market Covered Lot
  const space10 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Kavi Nagar Central Market Lot',
      description: 'Secured parking right behind Kavi Nagar C-Block shopping market. Guarded 24/7.',
      address: 'Block C Market, Kavi Nagar, Ghaziabad',
      latitude: 28.6700,
      longitude: 77.4500,
      pricePerHour: 40.0,
      capacity: 6,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 94,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Market Visitor Slot)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space10.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 11: Ghaziabad Railway Station North Lot
  const space11 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Ghaziabad Junction Station Safe Spot',
      description: 'Guarded parking area 150m from Ghaziabad Old Junction main platform entrance.',
      address: 'Station Road, Old City, Ghaziabad Junction',
      latitude: 28.6650,
      longitude: 77.4320,
      pricePerHour: 25.0,
      capacity: 12,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 91,
      availabilityStatus: 'AVAILABLE',
      dimensions: '17 x 8.5 ft (Station Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space11.id,
      url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 12: Govindpuram Main Gate Compound
  const space12 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Govindpuram Main Gate Compound',
      description: 'Open residential parking compound with perimeter security fence in Govindpuram.',
      address: 'Block E, Govindpuram, Ghaziabad',
      latitude: 28.6850,
      longitude: 77.4780,
      pricePerHour: 20.0,
      capacity: 5,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 88,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Open Compound)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space12.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 13: Connaught Place Inner Circle Garage (Central Delhi)
  const space13 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Connaught Place CP Inner Circle Underground',
      description: 'Underground automated parking slot 50m from Rajiv Chowk Metro Gate 3, Connaught Place.',
      address: 'Block B, Inner Circle, Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      pricePerHour: 60.0,
      capacity: 10,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 98,
      availabilityStatus: 'AVAILABLE',
      dimensions: '19 x 9.5 ft (CP Underground Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space13.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 14: South Extension Market Private Driveway (South Delhi)
  const space14 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'South Extension Part 2 Private Driveway',
      description: 'Gated residential driveway right next to South Extension Part 2 market. 24/7 Guarded.',
      address: 'E-Block, South Extension Part 2, New Delhi',
      latitude: 28.5700,
      longitude: 77.2200,
      pricePerHour: 50.0,
      capacity: 2,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 94,
      availabilityStatus: 'AVAILABLE',
      dimensions: '20 x 10 ft (South Delhi Driveway)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space14.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 15: IGI Airport Terminal 3 Express Parking (Delhi Airport)
  const space15 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'IGI Airport T3 Express Long-Stay Bay',
      description: 'Long-term secure parking slot near IGI Airport Terminal 3 multi-level structure.',
      address: 'Terminal 3 Access Road, IGI Airport, New Delhi',
      latitude: 28.5562,
      longitude: 77.0999,
      pricePerHour: 80.0,
      capacity: 15,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 99,
      availabilityStatus: 'AVAILABLE',
      dimensions: '22 x 10.5 ft (Airport Long-Stay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space15.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 16: Noida Sector 18 DLF Mall Multi-Level (Noida)
  const space16 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Noida Sector 18 DLF Mall Covered Slot',
      description: 'Reserved visitor slot in Sector 18 commercial hub near DLF Mall of India & Atta Market.',
      address: 'Sector 18 Commercial Belt, Noida, UP',
      latitude: 28.5708,
      longitude: 77.3260,
      pricePerHour: 45.0,
      capacity: 6,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 96,
      availabilityStatus: 'AVAILABLE',
      dimensions: '19 x 9 ft (Sector 18 Covered)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space16.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 17: Noida Sector 62 IT Park Basement (Noida)
  const space17 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Noida Sector 62 Stellar IT Park Basement',
      description: 'Climate-controlled basement slot in Sector 62 IT hub. CCTV & EV Charger installed.',
      address: 'Block C, Sector 62, Noida, UP',
      latitude: 28.6280,
      longitude: 77.3680,
      pricePerHour: 40.0,
      capacity: 5,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 93,
      availabilityStatus: 'AVAILABLE',
      dimensions: '20 x 10 ft (EV Charge Bay)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space17.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 18: Gaur City 2 Mall Bay (Greater Noida West)
  const space18 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Gaur City 2 Mall Visitor Bay',
      description: 'Gated parking bay in Gaur City 2 complex, Greater Noida West / Noida Extension.',
      address: 'Gaur City 2, Greater Noida West, UP',
      latitude: 28.6100,
      longitude: 77.4400,
      pricePerHour: 30.0,
      capacity: 4,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 92,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Greater Noida West)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space18.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 19: Pari Chowk Knowledge Park Safe Spot (Greater Noida Central)
  const space19 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Pari Chowk Knowledge Park Express Spot',
      description: 'Open guarded compound near Pari Chowk & Knowledge Park colleges, Greater Noida.',
      address: 'Knowledge Park 3, Pari Chowk, Greater Noida, UP',
      latitude: 28.4670,
      longitude: 77.5140,
      pricePerHour: 25.0,
      capacity: 8,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 91,
      availabilityStatus: 'AVAILABLE',
      dimensions: '18 x 9 ft (Pari Chowk Compound)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space19.id,
      url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 20: Cyber City DLF Cyber Hub Parking (Gurgaon / Gurugram)
  const space20 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Gurgaon DLF Cyber City Cyber Hub Premium Slot',
      description: 'Multi-level corporate basement parking right at DLF Cyber City / Cyber Hub entrance.',
      address: 'DLF Cyber City, Sector 24, Gurugram, Haryana',
      latitude: 28.4950,
      longitude: 77.0890,
      pricePerHour: 70.0,
      capacity: 12,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 98,
      availabilityStatus: 'AVAILABLE',
      dimensions: '21 x 10 ft (Cyber City Premium)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space20.id,
      url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 21: Golf Course Road Horizon Center Garage (Gurgaon)
  const space21 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Gurgaon Golf Course Road Horizon Center Spot',
      description: 'Underground garage with valet service near One Horizon Center, Golf Course Road.',
      address: 'Sector 43, Golf Course Road, Gurugram, Haryana',
      latitude: 28.4590,
      longitude: 77.0980,
      pricePerHour: 65.0,
      capacity: 8,
      vehicleType: 'FOUR_WHEELER',
      status: 'VERIFIED',
      verificationScore: 96,
      availabilityStatus: 'AVAILABLE',
      dimensions: '22 x 10 ft (Horizon Center Garage)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space21.id,
      url: 'https://images.unsplash.com/photo-1506521788723-85811181d4db?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // Space 22: MG Road Metro Station Reserved Spot (Gurgaon)
  const space22 = await prisma.parkingSpace.create({
    data: {
      ownerId: owner.id,
      name: 'Gurgaon MG Road Metro Station Express Bay',
      description: 'Covered parking space 100m from MG Road Metro Station and MGF Metropolitan Mall.',
      address: 'MG Road, Sector 25, Gurugram, Haryana',
      latitude: 28.4800,
      longitude: 77.0800,
      pricePerHour: 50.0,
      capacity: 5,
      vehicleType: 'BOTH',
      status: 'VERIFIED',
      verificationScore: 93,
      availabilityStatus: 'AVAILABLE',
      dimensions: '19 x 9 ft (MG Road Metro)',
    },
  });

  await prisma.parkingImage.create({
    data: {
      parkingSpaceId: space22.id,
      url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      isVerificationPhoto: true,
    },
  });

  // 4. Create historical bookings & reviews
  // Past Booking (Completed) for Space 1 by Rohan Driver
  // Past Booking (Completed) for Space 1 by Rohan Sharma (driver1)
  const booking1 = await prisma.booking.create({
    data: {
      driverId: driver1.id,
      parkingSpaceId: space1.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 3), // 3 days ago
      endTime: new Date(Date.now() - 3600000 * 24 * 3 + 3600000 * 2), // 2 hours duration
      durationHours: 2.0,
      totalAmount: 80.0,
      platformFee: 12.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_COMPLETED_123',
      checkInTime: new Date(Date.now() - 3600000 * 24 * 3 + 300000),
      checkOutTime: new Date(Date.now() - 3600000 * 24 * 3 + 3600000 * 2 - 100000),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: driver1.id,
      orderId: 'pay_order_sim_111',
      paymentId: 'pay_id_sim_111',
      amount: 92.0,
      status: 'SUCCESS',
      provider: 'SIMULATOR',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      driverId: driver1.id,
      parkingSpaceId: space1.id,
      rating: 5,
      comment: 'Extremely close to the college gate, very friendly owner. Safe driveway!',
    },
  });

  // Past Booking (Completed) for Space 2 by Priya Verma (driver2)
  const booking2 = await prisma.booking.create({
    data: {
      driverId: driver2.id,
      parkingSpaceId: space2.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 1),
      endTime: new Date(Date.now() - 3600000 * 24 * 1 + 3600000 * 4),
      durationHours: 4.0,
      totalAmount: 240.0,
      platformFee: 20.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_COMPLETED_456',
      checkInTime: new Date(Date.now() - 3600000 * 24 * 1 + 100000),
      checkOutTime: new Date(Date.now() - 3600000 * 24 * 1 + 3600000 * 4),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      userId: driver2.id,
      orderId: 'pay_order_sim_222',
      paymentId: 'pay_id_sim_222',
      amount: 260.0,
      status: 'SUCCESS',
      provider: 'SIMULATOR',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      driverId: driver2.id,
      parkingSpaceId: space2.id,
      rating: 2,
      comment: 'Tight entry turn on NH-24 service lane. Difficult for large SUVs without multiple reverse turns.',
    },
  });

  // Critical Negative Reviews for Space 9 (Raj Nagar Extension VVIP Basement) by Karan Malhotra & Neha Gupta
  const booking9_1 = await prisma.booking.create({
    data: {
      driverId: driver3.id,
      parkingSpaceId: space9.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 3),
      endTime: new Date(Date.now() - 3600000 * 24 * 3 + 7200000),
      durationHours: 2.0,
      totalAmount: 70.0,
      platformFee: 10.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_CRIT_91',
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking9_1.id,
      driverId: driver3.id,
      parkingSpaceId: space9.id,
      rating: 1,
      comment: 'Security guard at VVIP auto-gate refused to open without demanding an extra cash tip. Very unhelpful!',
    },
  });

  const booking9_2 = await prisma.booking.create({
    data: {
      driverId: driver4.id,
      parkingSpaceId: space9.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 2),
      endTime: new Date(Date.now() - 3600000 * 24 * 2 + 7200000),
      durationHours: 2.0,
      totalAmount: 70.0,
      platformFee: 10.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_CRIT_92',
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking9_2.id,
      driverId: driver4.id,
      parkingSpaceId: space9.id,
      rating: 2,
      comment: 'Water leaking from overhead basement pipes onto car bonnet. Dark and damp parking slot.',
    },
  });

  // Critical Negative Review for Space 6 (Indirapuram Habitat Centre) by Vikram Singh (driver5)
  const booking6 = await prisma.booking.create({
    data: {
      driverId: driver5.id,
      parkingSpaceId: space6.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 4),
      endTime: new Date(Date.now() - 3600000 * 24 * 4 + 10800000),
      durationHours: 3.0,
      totalAmount: 135.0,
      platformFee: 15.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_CRIT_6',
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking6.id,
      driverId: driver5.id,
      parkingSpaceId: space6.id,
      rating: 2,
      comment: 'Extremely tight pillar clearance. Scratched side mirror trying to park my vehicle.',
    },
  });

  // Critical Negative Review for Space 7 (Vaishali Metro) by Ananya Rao (driver6)
  const booking7 = await prisma.booking.create({
    data: {
      driverId: driver6.id,
      parkingSpaceId: space7.id,
      startTime: new Date(Date.now() - 3600000 * 24 * 5),
      endTime: new Date(Date.now() - 3600000 * 24 * 5 + 14400000),
      durationHours: 4.0,
      totalAmount: 200.0,
      platformFee: 20.0,
      status: 'COMPLETED',
      qrCode: 'QR_BOOKING_CRIT_7',
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking7.id,
      driverId: driver6.id,
      parkingSpaceId: space7.id,
      rating: 1,
      comment: 'Owner double-booked my slot with a neighbor. Had to wait 45 minutes on the main road in traffic.',
    },
  });

  console.log('Seed database completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
