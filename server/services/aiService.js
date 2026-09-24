/**
 * SPOTFIX Smart AI Engine (Heuristic NLP & Geospatial Engine)
 * Provides Explainable Intelligence for:
 * 1. Automated Category Suggestions
 * 2. Smart Priority Recommendations
 * 3. Intelligent Duplicate Detection (Geospatial + Semantic Matching)
 * 4. Issue History Summarization
 */

// Keyword dictionaries for Category Suggestion
const CATEGORY_KEYWORDS = {
  Pothole: ['pothole', 'crater', 'asphalt hole', 'road pit', 'bump', 'depression', 'sinkhole', 'cracked road', 'rough patch'],
  Streetlight: ['streetlight', 'street light', 'lamp', 'bulb', 'pole light', 'dark road', 'no light', 'flickering light', 'halogen', 'lighting', 'lantern'],
  Garbage: ['garbage', 'trash', 'waste', 'dump', 'dustbin', 'litter', 'smell', 'stench', 'refuse', 'plastic waste', 'overflowing bin', 'debris'],
  'Water Leakage': ['water leakage', 'leaking pipe', 'water pipe', 'burst pipe', 'pipe leak', 'water wastage', 'dripping valve', 'pipeline', 'sprinkler', 'overflow tank'],
  Drainage: ['drainage', 'clogged drain', 'gutter', 'sewage', 'blocked canal', 'manhole', 'stagnant water', 'waterlogging', 'flooding', 'foul water', 'culvert'],
  Footpath: ['footpath', 'sidewalk', 'pavement', 'paver block', 'pedestrian walk', 'kerb', 'broken tiles', 'walking track'],
  'Road Damage': ['road damage', 'broken road', 'tar missing', 'divider broken', 'speed breaker', 'caved in', 'road crack', 'gravel loose'],
  'Public Facility': ['bench', 'park', 'playground', 'swing', 'bus shelter', 'public toilet', 'drinking fountain', 'fence', 'gate', 'campus facility', 'auditorium'],
};

// Priority keywords and heuristics
const CRITICAL_KEYWORDS = ['hazard', 'emergency', 'danger', 'spark', 'electric shock', 'live wire', 'deep sinkhole', 'severe flood', 'fire hazard', 'gas smell', 'immediate risk'];
const HIGH_KEYWORDS = ['urgent', 'heavily blocked', 'major leak', 'no light main street', 'broken manhole', 'accident prone', 'unsafe', 'school zone', 'hospital entrance'];
const LOW_KEYWORDS = ['minor', 'slight', 'aesthetic', 'paint', 'small scratch', 'cosmetic', 'faded', 'tiny'];

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Tokenize and compute Jaccard Similarity between two texts
 */
const calculateTextSimilarity = (textA, textB) => {
  if (!textA || !textB) return 0;
  
  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersectionCount++;
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
};

/**
 * Suggests category based on title & description
 */
const suggestCategory = (title = '', description = '') => {
  const combined = `${title} ${description}`.toLowerCase();
  let bestCategory = 'Other';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    keywords.forEach((kw) => {
      if (combined.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1; // multi-word bonus
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  const confidence = maxScore > 0 ? Math.min(0.95, 0.5 + maxScore * 0.15) : 0.3;
  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
  };
};

/**
 * Suggests priority based on category, keywords, and text analysis
 */
const suggestPriority = (category = '', title = '', description = '') => {
  const combined = `${title} ${description}`.toLowerCase();

  // Check for critical flags
  for (const kw of CRITICAL_KEYWORDS) {
    if (combined.includes(kw)) {
      return { priority: 'CRITICAL', reason: `High-risk indicator detected: "${kw}"` };
    }
  }

  // Check for high flags
  for (const kw of HIGH_KEYWORDS) {
    if (combined.includes(kw)) {
      return { priority: 'HIGH', reason: `Urgency keyword detected: "${kw}"` };
    }
  }

  // Check category default tendencies
  if (['Drainage', 'Water Leakage'].includes(category)) {
    return { priority: 'HIGH', reason: `Category '${category}' typically impacts public sanitation & infrastructure.` };
  }

  if (['Streetlight', 'Pothole', 'Road Damage'].includes(category)) {
    return { priority: 'MEDIUM', reason: `Standard municipal maintenance tier for '${category}'.` };
  }

  // Check low keywords
  for (const kw of LOW_KEYWORDS) {
    if (combined.includes(kw)) {
      return { priority: 'LOW', reason: `Minor impact descriptor detected: "${kw}"` };
    }
  }

  return { priority: 'MEDIUM', reason: 'Default baseline service level assigned.' };
};

/**
 * Finds potential duplicate issues nearby with similar text / category
 * @param {Object} newIssue { title, description, category, latitude, longitude }
 * @param {Array} existingIssues List of active/recent issues from DB
 */
const detectDuplicates = (newIssue, existingIssues = []) => {
  const potentialDuplicates = [];
  const MAX_DISTANCE_METERS = 150; // within 150 meters

  for (const item of existingIssues) {
    // Ignore resolved or rejected issues older than 30 days
    if (['RESOLVED', 'REJECTED', 'CANCELLED'].includes(item.status)) continue;

    if (item.location && item.location.latitude && item.location.longitude) {
      const distance = calculateDistanceMeters(
        newIssue.latitude,
        newIssue.longitude,
        item.location.latitude,
        item.location.longitude
      );

      if (distance <= MAX_DISTANCE_METERS) {
        const textSim = calculateTextSimilarity(
          `${newIssue.title} ${newIssue.description}`,
          `${item.title} ${item.description}`
        );

        const categoryMatch =
          newIssue.category &&
          item.category &&
          newIssue.category.toLowerCase() === item.category.toLowerCase();

        // Calculate combined score
        let score = 0;
        if (categoryMatch) score += 0.4;
        score += textSim * 0.4;
        // Closer distance gets higher score
        const distScore = Math.max(0, (MAX_DISTANCE_METERS - distance) / MAX_DISTANCE_METERS) * 0.2;
        score += distScore;

        if (score >= 0.45 || (categoryMatch && distance <= 50)) {
          potentialDuplicates.push({
            issue: item,
            distanceMeters: distance,
            similarityScore: Number(score.toFixed(2)),
            similarityLevel: score >= 0.75 ? 'HIGH' : score >= 0.55 ? 'MEDIUM' : 'MODERATE',
            reason: `${distance}m away with matching category and text keywords.`,
          });
        }
      }
    }
  }

  return potentialDuplicates.sort((a, b) => b.similarityScore - a.similarityScore);
};

/**
 * Summarizes the entire history of an issue into an explainable digest
 */
const summarizeIssueHistory = (issue, histories = []) => {
  if (!histories || histories.length === 0) {
    return `Issue ${issue.issueCode} was reported on ${new Date(issue.createdAt).toLocaleDateString()} with status ${issue.status}.`;
  }

  const steps = histories.map((h) => {
    const actor = h.performedBy?.name || 'System';
    const date = new Date(h.timestamp).toLocaleDateString();
    return `${date}: ${h.action.replace(/_/g, ' ')} by ${actor} (${h.comment || 'No note'})`;
  });

  return `Timeline Digest for ${issue.issueCode} (${issue.title}): Currently [${issue.status}]. Progress has ${histories.length} milestone(s) recorded: ${steps.join(' → ')}.`;
};

module.exports = {
  suggestCategory,
  suggestPriority,
  detectDuplicates,
  calculateDistanceMeters,
  calculateTextSimilarity,
  summarizeIssueHistory,
};
