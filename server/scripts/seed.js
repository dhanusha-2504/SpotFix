const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Issue = require('../models/Issue');
const Assignment = require('../models/Assignment');
const Comment = require('../models/Comment');
const IssueHistory = require('../models/IssueHistory');
const Notification = require('../models/Notification');

const categoriesData = [
  { name: 'Pothole', description: 'Road potholes, craters, depressions and surface damage', defaultPriority: 'MEDIUM', slaHours: 48, icon: 'AlertTriangle' },
  { name: 'Streetlight', description: 'Broken, flickering or non-operational street lamps', defaultPriority: 'HIGH', slaHours: 24, icon: 'Lightbulb' },
  { name: 'Garbage', description: 'Overflowing dumpsters, litter piles, unsanitary waste', defaultPriority: 'MEDIUM', slaHours: 24, icon: 'Trash2' },
  { name: 'Water Leakage', description: 'Burst pipes, leaking municipal water lines and taps', defaultPriority: 'HIGH', slaHours: 12, icon: 'Droplets' },
  { name: 'Drainage', description: 'Clogged gutters, overflowing manholes, stagnant water', defaultPriority: 'CRITICAL', slaHours: 12, icon: 'Waves' },
  { name: 'Footpath', description: 'Damaged sidewalks, broken pavers, obstructed pedestrian paths', defaultPriority: 'LOW', slaHours: 72, icon: 'Footprints' },
  { name: 'Road Damage', description: 'Missing asphalt, damaged speed bumps, fallen dividers', defaultPriority: 'HIGH', slaHours: 48, icon: 'Car' },
  { name: 'Public Facility', description: 'Damaged park benches, broken fences, public toilets', defaultPriority: 'LOW', slaHours: 72, icon: 'Building' },
  { name: 'Other', description: 'General community maintenance problems', defaultPriority: 'MEDIUM', slaHours: 48, icon: 'HelpCircle' },
];

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Issue.deleteMany({});
    await Assignment.deleteMany({});
    await Comment.deleteMany({});
    await IssueHistory.deleteMany({});
    await Notification.deleteMany({});

    // 1. Seed Categories
    console.log('[Seed] Seeding categories...');
    await Category.insertMany(categoriesData);

    // 2. Seed Users
    console.log('[Seed] Seeding users with hashed passwords...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@spotfix.local',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+91 98765 43210',
      department: 'Central Municipal Authority',
    });

    const staff1 = await User.create({
      name: 'David Vance',
      email: 'staff.electrical@spotfix.local',
      password: 'Staff@1234',
      role: 'staff',
      phone: '+91 98765 43211',
      department: 'Electrical & Lighting',
    });

    const staff2 = await User.create({
      name: 'Carlos Mendez',
      email: 'staff.roads@spotfix.local',
      password: 'Staff@1234',
      role: 'staff',
      phone: '+91 98765 43212',
      department: 'Roads & Infrastructure',
    });

    const staff3 = await User.create({
      name: 'Sarah Jenkins',
      email: 'staff.sanitation@spotfix.local',
      password: 'Staff@1234',
      role: 'staff',
      phone: '+91 98765 43213',
      department: 'Sanitation & Water Works',
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'citizen.rahul@spotfix.local',
      password: 'User@1234',
      role: 'user',
      phone: '+91 98765 43214',
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'citizen.priya@spotfix.local',
      password: 'User@1234',
      role: 'user',
      phone: '+91 98765 43215',
    });

    console.log('[Seed] Users seeded successfully:');
    console.log('   👑 Admin: admin@spotfix.local | Admin@1234');
    console.log('   🛠️  Staff 1: staff.electrical@spotfix.local | Staff@1234');
    console.log('   🛠️  Staff 2: staff.roads@spotfix.local | Staff@1234');
    console.log('   🛠️  Staff 3: staff.sanitation@spotfix.local | Staff@1234');
    console.log('   👤 Citizen 1: citizen.rahul@spotfix.local | User@1234');
    console.log('   👤 Citizen 2: citizen.priya@spotfix.local | User@1234');

    // 3. Seed Realistic Issues
    console.log('[Seed] Seeding realistic issues across lifecycle states...');

    // Issue 1: Streetlight (REPORTED)
    const issue1 = await Issue.create({
      issueCode: 'SP-1001',
      title: 'Streetlight pole dark and flickering near Central Library',
      description: 'The overhead street lamp outside the campus library entrance has been completely dead for 3 nights, making the walkway very dark and unsafe for students studying late.',
      category: 'Streetlight',
      priority: 'HIGH',
      userSuggestedPriority: 'HIGH',
      aiSuggestedCategory: 'Streetlight',
      aiSuggestedPriority: 'HIGH',
      aiConfidence: 0.94,
      status: 'REPORTED',
      reportedBy: user1._id,
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Library Walkway, Near Block 3 Gate',
        landmark: 'Opposite Student Activity Center',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          type: 'BEFORE',
          uploadedBy: user1._id,
          caption: 'Dark walkway with broken lamp at night',
        },
      ],
    });

    await IssueHistory.create({
      issueId: issue1._id,
      action: 'ISSUE_CREATED',
      newStatus: 'REPORTED',
      performedBy: user1._id,
      comment: 'Issue reported by Rahul Sharma',
    });

    // Issue 2: Pothole (IN_PROGRESS)
    const issue2 = await Issue.create({
      issueCode: 'SP-1002',
      title: 'Deep pothole on Main Avenue causing traffic hazards',
      description: 'Large crater on the right lane after recent heavy monsoon showers. Multiple two-wheelers have lost balance.',
      category: 'Pothole',
      priority: 'CRITICAL',
      userSuggestedPriority: 'HIGH',
      aiSuggestedCategory: 'Pothole',
      aiSuggestedPriority: 'CRITICAL',
      aiConfidence: 0.92,
      status: 'IN_PROGRESS',
      reportedBy: user2._id,
      assignedTo: staff2._id,
      location: {
        latitude: 12.9735,
        longitude: 77.5982,
        address: 'Main Avenue Rd, Junction 4',
        landmark: 'Near Metro Pillar 142',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          type: 'BEFORE',
          uploadedBy: user2._id,
          caption: 'Deep asphalt hole on road',
        },
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
          type: 'PROGRESS',
          uploadedBy: staff2._id,
          caption: 'Gravel foundation poured and leveling underway',
        },
      ],
    });

    await Assignment.create({
      issueId: issue2._id,
      staffId: staff2._id,
      assignedBy: admin._id,
      notes: 'Please patch immediately with hot mix asphalt.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      acceptedAt: new Date(Date.now() - 3600000 * 4),
      startedAt: new Date(Date.now() - 3600000 * 2),
    });

    await IssueHistory.create([
      { issueId: issue2._id, action: 'ISSUE_CREATED', newStatus: 'REPORTED', performedBy: user2._id, comment: 'Reported by Priya Patel' },
      { issueId: issue2._id, action: 'REVIEW_APPROVED', oldStatus: 'REPORTED', newStatus: 'APPROVED', performedBy: admin._id, comment: 'Approved by Administrator. Priority escalated to CRITICAL.' },
      { issueId: issue2._id, action: 'STAFF_ASSIGNED', oldStatus: 'APPROVED', newStatus: 'ASSIGNED', performedBy: admin._id, comment: `Assigned to ${staff2.name}` },
      { issueId: issue2._id, action: 'STAFF_ACCEPTED', oldStatus: 'ASSIGNED', newStatus: 'ACCEPTED', performedBy: staff2._id, comment: 'Assignment accepted by Carlos Mendez' },
      { issueId: issue2._id, action: 'WORK_STARTED', oldStatus: 'ACCEPTED', newStatus: 'IN_PROGRESS', performedBy: staff2._id, comment: 'Field road crew deployed on site' },
    ]);

    // Issue 3: Garbage (VERIFICATION_PENDING)
    const issue3 = await Issue.create({
      issueCode: 'SP-1003',
      title: 'Overflowing municipal dumpster behind Food Court',
      description: 'Waste has piled up around the bins and is spilling onto the road with strong odor attracting stray animals.',
      category: 'Garbage',
      priority: 'MEDIUM',
      userSuggestedPriority: 'HIGH',
      aiSuggestedCategory: 'Garbage',
      aiSuggestedPriority: 'MEDIUM',
      aiConfidence: 0.96,
      status: 'VERIFICATION_PENDING',
      reportedBy: user1._id,
      assignedTo: staff3._id,
      location: {
        latitude: 12.9760,
        longitude: 77.6010,
        address: 'Food Court Rear Parking',
        landmark: 'Behind Building D',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
          type: 'BEFORE',
          uploadedBy: user1._id,
          caption: 'Overflowing trash containers',
        },
        {
          url: 'https://images.unsplash.com/photo-1611288875785-5dfb3f0ecf6b?auto=format&fit=crop&w=800&q=80',
          type: 'AFTER',
          uploadedBy: staff3._id,
          caption: 'Bins sanitized and area swept completely clear',
        },
      ],
    });

    await IssueHistory.create([
      { issueId: issue3._id, action: 'ISSUE_CREATED', newStatus: 'REPORTED', performedBy: user1._id },
      { issueId: issue3._id, action: 'STAFF_ASSIGNED', oldStatus: 'REPORTED', newStatus: 'ASSIGNED', performedBy: admin._id },
      { issueId: issue3._id, action: 'WORK_COMPLETED', oldStatus: 'IN_PROGRESS', newStatus: 'VERIFICATION_PENDING', performedBy: staff3._id, comment: 'Sanitation team cleared all waste and disinfected the area.' },
    ]);

    // Issue 4: Water Leakage (RESOLVED)
    const issue4 = await Issue.create({
      issueCode: 'SP-1004',
      title: 'Severe pipeline fracture causing clean drinking water wastage',
      description: 'Underground PVC line ruptured near the sports complex fountain. Hundreds of gallons leaking into the garden.',
      category: 'Water Leakage',
      priority: 'HIGH',
      userSuggestedPriority: 'HIGH',
      aiSuggestedCategory: 'Water Leakage',
      aiSuggestedPriority: 'HIGH',
      aiConfidence: 0.98,
      status: 'RESOLVED',
      reportedBy: user2._id,
      assignedTo: staff3._id,
      resolvedAt: new Date(Date.now() - 3600000 * 12),
      location: {
        latitude: 12.9690,
        longitude: 77.5910,
        address: 'Sports Complex West Wing',
        landmark: 'Near Tennis Court 2',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
          type: 'BEFORE',
          uploadedBy: user2._id,
          caption: 'Burst line gushing water',
        },
        {
          url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
          type: 'AFTER',
          uploadedBy: staff3._id,
          caption: 'New steel coupling installed and pressure tested',
        },
      ],
    });

    await IssueHistory.create([
      { issueId: issue4._id, action: 'ISSUE_CREATED', newStatus: 'REPORTED', performedBy: user2._id },
      { issueId: issue4._id, action: 'WORK_COMPLETED', oldStatus: 'IN_PROGRESS', newStatus: 'VERIFICATION_PENDING', performedBy: staff3._id },
      { issueId: issue4._id, action: 'RESOLUTION_VERIFIED', oldStatus: 'VERIFICATION_PENDING', newStatus: 'RESOLVED', performedBy: user2._id, comment: 'Verified by Priya Patel. Leakage stopped completely.' },
    ]);

    // Issue 5: Drainage (REOPENED)
    const issue5 = await Issue.create({
      issueCode: 'SP-1005',
      title: 'Clogged storm drain backing up into pedestrian pathway',
      description: 'Leaves and plastic debris blocking the storm drain grate near South Gate.',
      category: 'Drainage',
      priority: 'HIGH',
      userSuggestedPriority: 'HIGH',
      aiSuggestedCategory: 'Drainage',
      aiSuggestedPriority: 'HIGH',
      aiConfidence: 0.95,
      status: 'REOPENED',
      reportedBy: user1._id,
      assignedTo: staff3._id,
      reopenReason: 'Surface leaves were removed but subterranean culvert is still blocked and overflowing after 10 minutes of rain.',
      reopenedCount: 1,
      location: {
        latitude: 12.9780,
        longitude: 77.5950,
        address: 'South Gate Corridor',
        landmark: 'Beside Security Booth 1',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
          type: 'BEFORE',
          uploadedBy: user1._id,
          caption: 'Blocked culvert grate',
        },
      ],
    });

    await IssueHistory.create([
      { issueId: issue5._id, action: 'ISSUE_CREATED', newStatus: 'REPORTED', performedBy: user1._id },
      { issueId: issue5._id, action: 'WORK_COMPLETED', oldStatus: 'IN_PROGRESS', newStatus: 'VERIFICATION_PENDING', performedBy: staff3._id },
      { issueId: issue5._id, action: 'ISSUE_REOPENED', oldStatus: 'VERIFICATION_PENDING', newStatus: 'REOPENED', performedBy: user1._id, comment: 'Culvert interior still backed up. Needs jetting pump.' },
    ]);

    // 4. Seed Comments
    await Comment.create([
      { issueId: issue2._id, user: staff2._id, text: 'Arrived at location with asphalt roller crew. Setting up safety cones.' },
      { issueId: issue2._id, user: admin._id, text: 'Please ensure road signs are placed 50m prior to avoid evening rush hour congestion.', isInternal: true },
      { issueId: issue3._id, user: staff3._id, text: 'Sanitation truck #04 scheduled for collection at 2 PM.' },
    ]);

    // 5. Seed Notifications
    await Notification.create([
      {
        recipient: admin._id,
        sender: user1._id,
        issueId: issue1._id,
        title: 'New Issue: SP-1001',
        message: 'Rahul Sharma reported a broken streetlight near Central Library.',
        type: 'ISSUE_SUBMITTED',
        link: `/admin/issues/${issue1._id}`,
      },
      {
        recipient: user1._id,
        sender: staff3._id,
        issueId: issue3._id,
        title: 'Verification Needed: SP-1003',
        message: 'Sanitation staff marked SP-1003 as completed. Please review and verify.',
        type: 'VERIFICATION_REQUESTED',
        link: `/issues/${issue3._id}`,
      },
      {
        recipient: staff2._id,
        sender: admin._id,
        issueId: issue2._id,
        title: 'New Task Assignment: SP-1002',
        message: 'You have been assigned to repair deep pothole on Main Avenue.',
        type: 'STAFF_ASSIGNED',
        link: `/staff/issues/${issue2._id}`,
      },
    ]);

    console.log('[Seed] Database seeded successfully with categories, users, issues, assignments, comments, and notifications!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
