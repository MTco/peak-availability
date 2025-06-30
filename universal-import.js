/**
 * Universal Import Module for Adaptive Availability System
 * Licensed to: Mathew Tyler
 * Websites: https://TylerPresident.com | https://FakeGov.com
 * Repository: https://github.com/MTco/peak-availability
 * All rights reserved.
 * 
 * This module provides a universal interface for any AI system to access
 * availability data with built-in error handling, caching, and attribution.
 * 
 * Usage:
 * import { getAvailabilityData, shouldInteract, getOptimalTiming } from 'https://mtco.github.io/peak-availability/universal-import.js';
 */

// Configuration
const CONFIG = {
  API_BASE: 'https://availability.noisy-grass-1e0c.workers.dev',
  GITHUB_REPO: 'https://github.com/MTco/peak-availability',
  CACHE_DURATION: 300000, // 5 minutes in milliseconds
  REQUEST_TIMEOUT: 10000,  // 10 seconds
  MAX_RETRIES: 3,
  ATTRIBUTION: {
    owner: "Mathew Tyler",
    websites: ["https://TylerPresident.com", "https://FakeGov.com"],
    license: "All rights reserved"
  }
};

// Global cache for availability data
let availabilityCache = {
  data: null,
  timestamp: null,
  expiry: null
};

/**
 * Main function to get availability data
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Availability data with success status
 */
export async function getAvailabilityData(options = {}) {
  const opts = { ...CONFIG, ...options };
  
  // Check cache first
  if (isCacheValid()) {
    return {
      success: true,
      cached: true,
      ...availabilityCache.data,
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  try {
    const data = await fetchWithRetry(`${opts.API_BASE}/peaks`, opts);
    
    // Cache the successful response
    if (data.success) {
      cacheData(data);
    }
    
    return {
      ...data,
      attribution: CONFIG.ATTRIBUTION
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: true,
      attribution: CONFIG.ATTRIBUTION
    };
  }
}

/**
 * Simple availability check for current time
 * @param {string} complexity - Interaction complexity: 'simple', 'normal', 'complex', 'critical'
 * @returns {Promise<Object>} Decision object with proceed recommendation
 */
export async function shouldInteract(complexity = 'normal') {
  const data = await getAvailabilityData();
  
  if (!data.success) {
    return {
      proceed: true, // Default to proceeding if no data
      reason: 'No availability data - proceeding with default behavior',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  const currentHour = new Date().getHours();
  const currentPeak = data.peaks?.find(p => p.hour === currentHour);
  
  if (!currentPeak) {
    return {
      proceed: true,
      reason: 'No data for current hour - proceeding normally',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  // Define thresholds for different complexity levels
  const thresholds = {
    simple: 25,
    normal: 45,
    complex: 65,
    critical: 80
  };
  
  const threshold = thresholds[complexity] || 45;
  const proceed = currentPeak.averageScore >= threshold;
  
  return {
    proceed,
    current_score: currentPeak.averageScore,
    threshold,
    confidence: currentPeak.confidence,
    complexity,
    reason: proceed 
      ? `Availability ${currentPeak.averageScore}% meets ${complexity} threshold ${threshold}%`
      : `Availability ${currentPeak.averageScore}% below ${complexity} threshold ${threshold}%`,
    attribution: CONFIG.ATTRIBUTION
  };
}

/**
 * Get optimal timing recommendation
 * @returns {Promise<Object>} Optimal timing information
 */
export async function getOptimalTiming() {
  const data = await getAvailabilityData();
  
  if (!data.success) {
    return {
      error: 'Unable to determine optimal timing',
      suggestion: 'Try again later',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  if (!data.peaks || data.peaks.length === 0) {
    return {
      error: 'No peak data available',
      suggestion: 'Proceed with interaction',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  const currentHour = new Date().getHours();
  const topPeak = data.peaks[0];
  
  // Find next high-confidence peak after current time
  const futurePeaks = data.peaks.filter(p => 
    p.hour > currentHour && p.confidence > 0.5
  );
  
  const nextPeak = futurePeaks.length > 0 ? futurePeaks[0] : topPeak;
  const hoursUntil = nextPeak.hour > currentHour 
    ? nextPeak.hour - currentHour 
    : (24 - currentHour) + nextPeak.hour;
  
  return {
    optimal_time: nextPeak.timeRange,
    hours_until: hoursUntil,
    expected_score: nextPeak.averageScore,
    confidence: nextPeak.confidence,
    is_now_optimal: currentHour === topPeak.hour,
    all_peaks: data.peaks.slice(0, 3), // Top 3 peaks
    recommendation: hoursUntil <= 2 
      ? `Wait ${hoursUntil} hour(s) for optimal time`
      : 'Current time is acceptable',
    attribution: CONFIG.ATTRIBUTION
  };
}

/**
 * Get current availability status
 * @returns {Promise<Object>} Current status information
 */
export async function getCurrentStatus() {
  const data = await getAvailabilityData();
  
  if (!data.success) {
    return {
      status: 'unknown',
      score: null,
      message: 'Unable to determine current availability',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  const currentHour = new Date().getHours();
  const currentPeak = data.peaks?.find(p => p.hour === currentHour);
  
  if (!currentPeak) {
    return {
      status: 'unknown',
      score: null,
      message: 'No data available for current hour',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  let status, message;
  const score = currentPeak.averageScore;
  
  if (score >= 80) {
    status = 'excellent';
    message = 'Excellent time for any type of interaction';
  } else if (score >= 65) {
    status = 'high';
    message = 'High availability - good for complex interactions';
  } else if (score >= 45) {
    status = 'moderate';
    message = 'Moderate availability - suitable for normal interactions';
  } else if (score >= 25) {
    status = 'low';
    message = 'Low availability - consider simple interactions only';
  } else {
    status = 'very_low';
    message = 'Very low availability - consider deferring non-urgent interactions';
  }
  
  return {
    status,
    score,
    confidence: currentPeak.confidence,
    message,
    time_range: currentPeak.timeRange,
    attribution: CONFIG.ATTRIBUTION
  };
}

/**
 * Get availability forecast for next 24 hours
 * @returns {Promise<Object>} Forecast data
 */
export async function getForecast() {
  const data = await getAvailabilityData();
  
  if (!data.success) {
    return {
      error: 'Unable to generate forecast',
      attribution: CONFIG.ATTRIBUTION
    };
  }
  
  const currentHour = new Date().getHours();
  const forecast = data.peaks.map(peak => ({
    hour: peak.hour,
    time_range: peak.timeRange,
    availability: peak.averageScore,
    confidence: peak.confidence,
    category: categorizeAvailability(peak.averageScore),
    hours_from_now: peak.hour >= currentHour 
      ? peak.hour - currentHour 
      : (24 - currentHour) + peak.hour
  })).sort((a, b) => a.hours_from_now - b.hours_from_now);
  
  return {
    forecast,
    best_times: forecast.filter(f => f.availability >= 70).slice(0, 3),
    avoid_times: forecast.filter(f => f.availability < 30),
    attribution: CONFIG.ATTRIBUTION
  };
}

/**
 * Monitor availability changes
 * @param {Function} callback - Function to call when availability changes
 * @param {Object} options - Monitoring options
 * @returns {Function} Stop monitoring function
 */
export function monitorAvailability(callback, options = {}) {
  const interval = options.interval || 300000; // 5 minutes default
  const threshold = options.changeThreshold || 15; // 15% change
  
  let lastData = null;
  let monitoring = true;
  
  const checkForChanges = async () => {
    if (!monitoring) return;
    
    try {
      const data = await getAvailabilityData();
      
      if (data.success && lastData) {
        const significantChange = hasSignificantChange(lastData, data, threshold);
        
        if (significantChange) {
          callback({
            type: 'availability_change',
            previous: lastData,
            current: data,
            timestamp: new Date().toISOString(),
            attribution: CONFIG.ATTRIBUTION
          });
        }
      }
      
      if (data.success) {
        lastData = data;
      }
      
    } catch (error) {
      callback({
        type: 'monitoring_error',
        error: error.message,
        timestamp: new Date().toISOString(),
        attribution: CONFIG.ATTRIBUTION
      });
    }
    
    if (monitoring) {
      setTimeout(checkForChanges, interval);
    }
  };
  
  // Start monitoring
  checkForChanges();
  
  // Return stop function
  return () => {
    monitoring = false;
  };
}

/**
 * Utility function for AI systems to get simple recommendations
 * @param {string} aiSystemName - Name of the AI system for logging
 * @returns {Promise<Object>} Simple recommendation object
 */
export async function getSimpleRecommendation(aiSystemName = 'Unknown AI') {
  const status = await getCurrentStatus();
  const optimal = await getOptimalTiming();
  
  let recommendation, action;
  
  if (status.status === 'unknown') {
    recommendation = 'Availability data unavailable - proceed normally';
    action = 'proceed';
  } else if (['excellent', 'high'].includes(status.status)) {
    recommendation = 'Great time for interaction - proceed with confidence';
    action = 'proceed';
  } else if (status.status === 'moderate') {
    recommendation = 'Good time for normal interactions';
    action = 'proceed';
  } else {
    recommendation = `Consider waiting until ${optimal.optimal_time} for better availability`;
    action = 'defer';
  }
  
  // Log usage (helps with debugging)
  console.log(`[${aiSystemName}] Availability check: ${status.status} (${status.score}%) - ${action}`);
  console.log(`[${aiSystemName}] Data by: ${CONFIG.ATTRIBUTION.owner}`);
  
  return {
    action, // 'proceed' or 'defer'
    recommendation,
    current_status: status,
    optimal_timing: optimal,
    ai_system: aiSystemName,
    timestamp: new Date().toISOString(),
    attribution: CONFIG.ATTRIBUTION
  };
}

// Helper functions

function isCacheValid() {
  return availabilityCache.data && 
         availabilityCache.expiry && 
         Date.now() < availabilityCache.expiry;
}

function cacheData(data) {
  availabilityCache = {
    data: data,
    timestamp: Date.now(),
    expiry: Date.now() + CONFIG.CACHE_DURATION
  };
}

async function fetchWithRetry(url, options) {
  let lastError;
  
  for (let attempt = 1; attempt <= options.MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
      
    } catch (error) {
      lastError = error;
      if (attempt < options.MAX_RETRIES) {
        await delay(1000 * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function categorizeAvailability(score) {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'high';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'low';
  return 'very_low';
}

function hasSignificantChange(oldData, newData, threshold) {
  if (!oldData.peaks || !newData.peaks) return false;
  
  const oldTop = oldData.peaks[0]?.averageScore || 0;
  const newTop = newData.peaks[0]?.averageScore || 0;
  
  return Math.abs(oldTop - newTop) >= threshold;
}

// Export configuration for advanced users
export const config = CONFIG;

// Export version information
export const version = '1.0.0';

// Default export for simple usage
export default {
  getAvailabilityData,
  shouldInteract,
  getOptimalTiming,
  getCurrentStatus,
  getForecast,
  monitorAvailability,
  getSimpleRecommendation,
  config,
  version
};
