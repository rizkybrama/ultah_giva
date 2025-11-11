// Validation helpers for object placement
// Ensures all objects follow placement rules automatically
//
// USAGE EXAMPLES:
//
// 1. For outdoor objects (random position):
//    const position = generateValidPosition({
//      avoidPath: true,
//      avoidHouse: true,
//      minDistanceFromPath: 3,
//      minDistanceFromHouse: 2,
//      collision: true
//    });
//    object.position.set(position.x, y, position.z);
//    addToCollision(object, collisionObjects, rules);
//
// 2. For interior objects (specific position):
//    setValidatedPosition(object, x, y, z, {
//      insideHouse: true,
//      collision: true
//    });
//    addToCollision(object, collisionObjects, rules);
//
// 3. For objects with custom position but need validation:
//    const validation = validatePosition(x, z, rules);
//    if (validation.valid) {
//      object.position.set(x, y, z);
//    }

export interface ExclusionZone {
  x: number;
  z: number;
  radius: number; // Radius of exclusion zone
}

export interface ValidationRules {
  avoidPath?: boolean;           // Object must be outside path
  avoidHouse?: boolean;          // Object must be outside house (for outdoor objects)
  insideHouse?: boolean;         // Object must be inside house (for interior objects)
  collision?: boolean;           // Object should have collision detection
  minDistanceFromHouse?: number; // Minimum distance from house (for outdoor objects)
  minDistanceFromPath?: number;   // Minimum distance from path
  excludeZones?: ExclusionZone[]; // Areas where objects cannot be placed (e.g., under mountains)
}

export interface HouseBounds {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

export interface PathBounds {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

// House boundaries - updated when house size changes
export const HOUSE_BOUNDS: HouseBounds = {
  xMin: -20,
  xMax: 20,
  zMin: -6,
  zMax: 24
};

// Path boundaries - path leading to door
export const PATH_BOUNDS: PathBounds = {
  xMin: -2.5,
  xMax: 0.5,
  zMin: -18,
  zMax: 2
};

// Default margins
const DEFAULT_HOUSE_MARGIN = 2;
const DEFAULT_PATH_MARGIN = 3;
const DEFAULT_MIN_DISTANCE_FROM_HOUSE = 5;

/**
 * Check if position is on path
 */
export function isOnPath(x: number, z: number, margin: number = 0): boolean {
  return x >= PATH_BOUNDS.xMin - margin && x <= PATH_BOUNDS.xMax + margin &&
         z >= PATH_BOUNDS.zMin - margin && z <= PATH_BOUNDS.zMax + margin;
}

/**
 * Check if position is inside house
 */
export function isInsideHouse(x: number, z: number, margin: number = 0): boolean {
  return x >= HOUSE_BOUNDS.xMin - margin && x <= HOUSE_BOUNDS.xMax + margin &&
         z >= HOUSE_BOUNDS.zMin - margin && z <= HOUSE_BOUNDS.zMax + margin;
}

/**
 * Check if position is too close to house
 */
export function isTooCloseToHouse(x: number, z: number, minDistance: number): boolean {
  // Check if position is within minimum distance from any house boundary
  const distFromLeft = Math.abs(x - HOUSE_BOUNDS.xMin);
  const distFromRight = Math.abs(x - HOUSE_BOUNDS.xMax);
  const distFromFront = Math.abs(z - HOUSE_BOUNDS.zMin);
  const distFromBack = Math.abs(z - HOUSE_BOUNDS.zMax);
  
  // If inside house bounds, definitely too close
  if (isInsideHouse(x, z, 0)) return true;
  
  // Check distance from boundaries
  if (x >= HOUSE_BOUNDS.xMin && x <= HOUSE_BOUNDS.xMax) {
    // Inside x bounds, check z distance
    return distFromFront < minDistance || distFromBack < minDistance;
  }
  if (z >= HOUSE_BOUNDS.zMin && z <= HOUSE_BOUNDS.zMax) {
    // Inside z bounds, check x distance
    return distFromLeft < minDistance || distFromRight < minDistance;
  }
  
  // Check corner distance
  const minDist = Math.min(distFromLeft, distFromRight, distFromFront, distFromBack);
  return minDist < minDistance;
}

/**
 * Check if position is in exclusion zone
 */
function isInExclusionZone(x: number, z: number, exclusionZones: ExclusionZone[]): boolean {
  for (const zone of exclusionZones) {
    const distance = Math.sqrt(
      Math.pow(x - zone.x, 2) + Math.pow(z - zone.z, 2)
    );
    if (distance < zone.radius) {
      return true;
    }
  }
  return false;
}

/**
 * Validate position against rules
 */
export function validatePosition(
  x: number,
  z: number,
  rules: ValidationRules
): { valid: boolean; reason?: string } {
  // Check exclusion zones first (e.g., under mountains)
  if (rules.excludeZones && rules.excludeZones.length > 0) {
    if (isInExclusionZone(x, z, rules.excludeZones)) {
      return { valid: false, reason: 'Position is in exclusion zone (e.g., under mountain)' };
    }
  }
  
  // Check path avoidance
  if (rules.avoidPath !== false) { // Default to true if not specified
    const pathMargin = rules.minDistanceFromPath || DEFAULT_PATH_MARGIN;
    if (isOnPath(x, z, pathMargin)) {
      return { valid: false, reason: 'Position is on or too close to path' };
    }
  }
  
  // Check house avoidance (for outdoor objects)
  if (rules.avoidHouse) {
    const houseMargin = rules.minDistanceFromHouse || DEFAULT_HOUSE_MARGIN;
    if (isInsideHouse(x, z, houseMargin)) {
      return { valid: false, reason: 'Position is inside house' };
    }
    
    // Check minimum distance from house
    if (rules.minDistanceFromHouse) {
      if (isTooCloseToHouse(x, z, rules.minDistanceFromHouse)) {
        return { valid: false, reason: 'Position is too close to house' };
      }
    }
  }
  
  // Check inside house requirement (for interior objects)
  if (rules.insideHouse) {
    if (!isInsideHouse(x, z, -0.5)) { // Negative margin to ensure truly inside
      return { valid: false, reason: 'Position must be inside house' };
    }
  }
  
  return { valid: true };
}

/**
 * Generate safe position that satisfies all validation rules
 */
export function generateValidPosition(
  rules: ValidationRules,
  attempts: number = 200
): { x: number; z: number; success: boolean } {
  const pathMargin = rules.minDistanceFromPath || DEFAULT_PATH_MARGIN;
  const houseMargin = rules.minDistanceFromHouse || DEFAULT_HOUSE_MARGIN;
  
  let x: number, z: number;
  let attemptCount = 0;
  
  do {
    // Generate position based on rules
    if (rules.insideHouse) {
      // For interior objects, generate inside house
      x = HOUSE_BOUNDS.xMin + 1 + Math.random() * (HOUSE_BOUNDS.xMax - HOUSE_BOUNDS.xMin - 2);
      z = HOUSE_BOUNDS.zMin + 1 + Math.random() * (HOUSE_BOUNDS.zMax - HOUSE_BOUNDS.zMin - 2);
    } else {
      // For outdoor objects, generate outside house and path
      // Choose a side: left, right, front, or back
      const side = Math.floor(Math.random() * 4);
      const areaSize = 20; // Area size for placement
      
      if (side === 0) {
        // Left side of path
        x = PATH_BOUNDS.xMin - pathMargin - Math.random() * areaSize;
        if (Math.random() > 0.5) {
          z = PATH_BOUNDS.zMin - pathMargin - Math.random() * areaSize;
        } else {
          z = PATH_BOUNDS.zMax + pathMargin + Math.random() * areaSize;
        }
      } else if (side === 1) {
        // Right side of path
        x = PATH_BOUNDS.xMax + pathMargin + Math.random() * areaSize;
        if (Math.random() > 0.5) {
          z = PATH_BOUNDS.zMin - pathMargin - Math.random() * areaSize;
        } else {
          z = PATH_BOUNDS.zMax + pathMargin + Math.random() * areaSize;
        }
      } else if (side === 2) {
        // Front of path
        z = PATH_BOUNDS.zMin - pathMargin - Math.random() * areaSize;
        if (Math.random() > 0.5) {
          x = PATH_BOUNDS.xMin - pathMargin - Math.random() * areaSize;
        } else {
          x = PATH_BOUNDS.xMax + pathMargin + Math.random() * areaSize;
        }
      } else {
        // Back of path
        z = PATH_BOUNDS.zMax + pathMargin + Math.random() * areaSize;
        if (Math.random() > 0.5) {
          x = PATH_BOUNDS.xMin - pathMargin - Math.random() * areaSize;
        } else {
          x = PATH_BOUNDS.xMax + pathMargin + Math.random() * areaSize;
        }
      }
    }
    
    attemptCount++;
    
    // Validate position
    const validation = validatePosition(x, z, rules);
    if (validation.valid) {
      return { x, z, success: true };
    }
    
  } while (attemptCount < attempts);
  
  // Fallback: force to safe position
  if (rules.insideHouse) {
    // Center of house as fallback
    x = (HOUSE_BOUNDS.xMin + HOUSE_BOUNDS.xMax) / 2;
    z = (HOUSE_BOUNDS.zMin + HOUSE_BOUNDS.zMax) / 2;
  } else {
    // Far left and front as fallback
    x = HOUSE_BOUNDS.xMin - houseMargin - 10;
    z = HOUSE_BOUNDS.zMin - houseMargin - 10;
  }
  
  return { x, z, success: false };
}

/**
 * Add object to collision array if collision is enabled
 */
export function addToCollision(
  object: any,
  collisionObjects: any[],
  rules: ValidationRules
): void {
  if (rules.collision !== false) { // Default to true if not specified
    // If object has children (like Group), traverse and add all meshes
    if (object.children && object.children.length > 0) {
      object.traverse((child: any) => {
        if (child.geometry && child.position) {
          collisionObjects.push(child);
        }
      });
    } else if (object.geometry) {
      // Single mesh object
      collisionObjects.push(object);
    }
  }
}

/**
 * Create object with automatic validation
 * This is the main helper function to use when creating new objects
 */
export function createValidatedObject<T>(
  createFn: (x: number, z: number) => T,
  rules: ValidationRules,
  collisionObjects?: any[]
): T | null {
  const position = generateValidPosition(rules);
  
  if (!position.success && rules.insideHouse) {
    // For interior objects, we can still place at fallback position
    console.warn('Failed to generate valid position, using fallback');
  } else if (!position.success) {
    console.warn('Failed to generate valid position for outdoor object');
    return null;
  }
  
  const object = createFn(position.x, position.z);
  
  // Add to collision if needed
  if (collisionObjects) {
    addToCollision(object as any, collisionObjects, rules);
  }
  
  return object;
}

/**
 * Validate and set position for an object
 * Use this when you already have a specific position but want to ensure it's valid
 */
export function setValidatedPosition(
  object: any,
  x: number,
  y: number,
  z: number,
  rules: ValidationRules
): boolean {
  // Validate x and z (y is usually fixed for height)
  const validation = validatePosition(x, z, rules);
  
  if (!validation.valid) {
    console.warn(`Invalid position for object: ${validation.reason}`, { x, z });
    // Try to find a valid position nearby
    const validPos = generateValidPosition(rules);
    if (validPos.success) {
      object.position.set(validPos.x, y, validPos.z);
      return true;
    }
    return false;
  }
  
  object.position.set(x, y, z);
  return true;
}

/**
 * Create object at specific position with validation
 * Use this when you want to place object at specific coordinates but ensure they're valid
 */
export function createObjectAtPosition(
  createFn: () => any,
  x: number,
  y: number,
  z: number,
  rules: ValidationRules,
  collisionObjects?: any[]
): any | null {
  const validation = validatePosition(x, z, rules);
  
  if (!validation.valid) {
    console.warn(`Invalid position: ${validation.reason}`, { x, z });
    // Try to find a valid position nearby
    const validPos = generateValidPosition(rules);
    if (!validPos.success) {
      return null;
    }
    x = validPos.x;
    z = validPos.z;
  }
  
  const object = createFn();
  object.position.set(x, y, z);
  
  // Add to collision if needed
  if (collisionObjects) {
    addToCollision(object, collisionObjects, rules);
  }
  
  return object;
}

