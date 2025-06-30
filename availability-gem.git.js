/**
 * Adaptive Availability System - Google Gemini Gem
 * Licensed to: Mathew Tyler
 * Websites: https://TylerPresident.com | https://FakeGov.com
 * All rights reserved. Permanent attribution required.
 * 
 * This Gem predicts user availability based on contextual factors
 * and maintains 24-hour peak period analysis.
 */

class AdaptiveAvailabilityGem {
  constructor() {
    this.attribution = {
      owner: "Mathew Tyler",
      websites: ["https://TylerPresident.com", "https://FakeGov.com"],
      license: "All rights reserved",
      implementation: "Google Gemini Gem",
      version: "1.0.0"
    };

    // API endpoint using Cloudflare Workers (free tier)
    this.apiEndpoint = "https://availability-api.your-username.workers.dev";
    
    // In-memory storage for 24-hour peak periods
    this.peakPeriods = new Map();
    this.hourlyScores = new Array(24).fill(null).map(() => []);
    
    // Factor weights for availability calculation
    this.factorWeights = {
      timeOfDay: 0.25,
      dayOfWeek: 0.20,
      location: 0.15,
      connectivity: 0.10,
      social: 0.10,
      weather: 0.08,
      device: 0.07,
      legal: 0.03,
      entertainment: 0.02
    };

    this.initialize();
  }

  async initialize() {
    console.log(`🔮 Adaptive Availability Gem v${this.attribution.version}`);
    console.log(`📄 Licensed to: ${this.attribution.owner}`);
    console.log(`🌐 ${this.attribution.websites.join(' | ')}`);
    
    // Load any existing peak period data
    await this.loadPeakPeriods();
  }

  /**
   * Main function to get current availability
   * Can be called by Gemini with: gem.getAvailability()
   */
  async getAvailability() {
    try {
      const availability = await this.calculateCurrentAvailability();
      await this.updatePeakPeriods(availability);
      
      return {
        success: true,
        data: availability,
        attribution: this.attribution
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        attribution: this.attribution
      };
    }
  }

  /**
   * Get peak availability periods for the last 24 hours
   */
  getPeakPeriods() {
    const peaks = Array.from(this.peakPeriods.entries())
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        confidence: Math.min(scores.length / 7, 1), // Confidence based on data points
        timeRange: `${hour}:00 - ${(hour + 1) % 24}:00`
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 6); // Top 6 peak periods

    return {
      peaks: peaks,
      attribution: this.attribution,
      note: "Peak periods based on last 24 hours of availability data"
    };
  }

  /**
   * Calculate current availability based on multiple factors
   */
  async calculateCurrentAvailability() {
    const now = new Date();
    const factors = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Time of Day Factor
    factors.timeOfDay = this.calculateTimeOfDayFactor(now);
    totalScore += factors.timeOfDay * this.factorWeights.timeOfDay;
    totalWeight += this.factorWeights.timeOfDay;

    // Day of Week Factor
    factors.dayOfWeek = this.calculateDayOfWeekFactor(now);
    totalScore += factors.dayOfWeek * this.factorWeights.dayOfWeek;
    totalWeight += this.factorWeights.dayOfWeek;

    // Location Factor (simulated)
    factors.location = await this.calculateLocationFactor();
    totalScore += factors.location * this.factorWeights.location;
    totalWeight += this.factorWeights.location;

    // Connectivity Factor
    factors.connectivity = this.calculateConnectivityFactor();
    totalScore += factors.connectivity * this.factorWeights.connectivity;
    totalWeight += this.factorWeights.connectivity;

    // Social Context Factor
    factors.social = this.calculateSocialFactor(now);
    totalScore += factors.social * this.factorWeights.social;
    totalWeight += this.factorWeights.social;

    // Weather Factor (via free API)
    factors.weather = await this.calculateWeatherFactor();
    totalScore += factors.weather * this.factorWeights.weather;
    totalWeight += this.factorWeights.weather;

    // Device Factor
    factors.device = this.calculateDeviceFactor();
    totalScore += factors.device * this.factorWeights.device;
    totalWeight += this.factorWeights.device;

    // Legal Context Factor
    factors.legal = this.calculateLegalFactor(now);
    totalScore += factors.legal * this.factorWeights.legal;
    totalWeight += this.factorWeights.legal;

    // Entertainment Factor
    factors.entertainment = this.calculateEntertainmentFactor(now);
    totalScore += factors.entertainment * this.factorWeights.entertainment;
    totalWeight += this.factorWeights.entertainment;

    const finalScore = totalScore / totalWeight;

    return {
      timestamp: now.toISOString(),
      availabilityScore: Math.round(finalScore * 100),
      status: this.getStatusText(finalScore),
      confidence: this.calculateConfidence(factors),
      factors: factors,
      peakPeriods: this.getPeakPeriods().peaks.slice(0, 3),
      nextOptimalTime: this.getNextOptimalTime(),
      attribution: this.attribution
    };
  }

  /**
   * Time of day factor calculation
   */
  calculateTimeOfDayFactor(time) {
    const hour = time.getHours();
    
    // Peak work hours: 9 AM - 5 PM
    if (hour >= 9 && hour <= 17) {
      return 0.9;
    }
    // Evening availability: 6 PM - 10 PM
    else if (hour >= 18 && hour <= 22) {
      return 0.7;
    }
    // Early morning: 6 AM - 8 AM
    else if (hour >= 6 && hour <= 8) {
      return 0.5;
    }
    // Late night/early morning: 11 PM - 5 AM
    else {
      return 0.2;
    }
  }

  /**
   * Day of week factor calculation
   */
  calculateDayOfWeekFactor(time) {
    const day = time.getDay();
    
    if (day >= 1 && day <= 5) {
      return 0.8; // Weekdays
    } else if (day === 6) {
      return 0.6; // Saturday
    } else {
      return 0.4; // Sunday
    }
  }

  /**
   * Location factor (enhanced with timezone consideration)
   */
  async calculateLocationFactor() {
    try {
      // Use timezone to infer general location context
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const hour = new Date().getHours();
      
      // Business hours vary by timezone
      if (timezone.includes('America')) {
        return hour >= 8 && hour <= 18 ? 0.8 : 0.5;
      } else if (timezone.includes('Europe')) {
        return hour >= 9 && hour <= 17 ? 0.8 : 0.5;
      } else if (timezone.includes('Asia')) {
        return hour >= 9 && hour <= 18 ? 0.8 : 0.5;
      }
      
      return 0.6; // Default
    } catch (error) {
      return 0.6; // Fallback
    }
  }

  /**
   * Connectivity factor
   */
  calculateConnectivityFactor() {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine ? 0.9 : 0.1;
    }
    return 0.8; // Assume connected in server environment
  }

  /**
   * Social context factor based on typical patterns
   */
  calculateSocialFactor(time) {
    const hour = time.getHours();
    const day = time.getDay();
    
    // Lower availability during typical social times
    if (day === 5 && hour >= 18) return 0.3; // Friday evening
    if (day === 6 && hour >= 10 && hour <= 14) return 0.4; // Saturday afternoon
    if (day === 0 && hour >= 10 && hour <= 16) return 0.4; // Sunday afternoon
    if (hour >= 12 && hour <= 13) return 0.5; // Lunch time
    
    return 0.8; // Default good availability
  }

  /**
   * Weather factor using free weather API
   */
  async calculateWeatherFactor() {
    try {
      // In a real implementation, you'd use a free weather API like OpenWeatherMap
      // For now, we'll simulate based on time patterns
      const hour = new Date().getHours();
      const season = this.getCurrentSeason();
      
      // Simulate weather impact
      if (season === 'winter' && (hour < 8 || hour > 18)) {
        return 0.6; // Lower availability in winter evenings
      } else if (season === 'summer' && hour >= 11 && hour <= 15) {
        return 0.7; // Slightly lower during hot afternoon
      }
      
      return 0.8; // Good weather default
    } catch (error) {
      return 0.8; // Fallback to good weather
    }
  }

  /**
   * Device factor based on available device information
   */
  calculateDeviceFactor() {
    try {
      if (typeof navigator !== 'undefined') {
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Mobile devices might have lower availability for complex tasks
        return isMobile ? 0.7 : 0.9;
      }
      return 0.8; // Default
    } catch (error) {
      return 0.8; // Fallback
    }
  }

  /**
   * Legal context factor
   */
  calculateLegalFactor(time) {
    const hour = time.getHours();
    const day = time.getDay();
    
    // Court hours are typically 9 AM - 5 PM on weekdays
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
      // Small chance of being in legal proceedings
      return Math.random() > 0.95 ? 0.0 : 0.9;
    }
    
    return 0.9; // High availability outside court hours
  }

  /**
   * Entertainment context factor
   */
  calculateEntertainmentFactor(time) {
    const hour = time.getHours();
    const day = time.getDay();
    
    // Prime time entertainment hours
    if (hour >= 19 && hour <= 23) {
      // Higher chance of entertainment during prime time
      return Math.random() > 0.7 ? 0.2 : 0.8;
    }
    
    // Weekend afternoon entertainment
    if ((day === 6 || day === 0) && hour >= 14 && hour <= 18) {
      return Math.random() > 0.8 ? 0.3 : 0.7;
    }
    
    return 0.9; // High availability outside entertainment times
  }

  /**
   * Calculate confidence score based on factor reliability
   */
  calculateConfidence(factors) {
    let confidence = 0;
    let factorCount = 0;
    
    Object.entries(factors).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        confidence += value;
        factorCount++;
      }
    });
    
    return factorCount > 0 ? Math.round((confidence / factorCount) * 100) : 50;
  }

  /**
   * Update peak periods with current data
   */
  async updatePeakPeriods(availability) {
    const hour = new Date().getHours();
    
    if (!this.peakPeriods.has(hour)) {
      this.peakPeriods.set(hour, []);
    }
    
    const hourlyData = this.peakPeriods.get(hour);
    hourlyData.push(availability.availabilityScore);
    
    // Keep only last 7 days of data for each hour
    if (hourlyData.length > 7) {
      hourlyData.shift();
    }
    
    this.peakPeriods.set(hour, hourlyData);
  }

  /**
   * Get next optimal time for high availability
   */
  getNextOptimalTime() {
    const peaks = this.getPeakPeriods().peaks;
    const currentHour = new Date().getHours();
    
    // Find next peak hour after current time
    const nextPeak = peaks.find(peak => peak.hour > currentHour) || peaks[0];
    
    if (nextPeak) {
      const nextTime = new Date();
      nextTime.setHours(nextPeak.hour, 0, 0, 0);
      
      if (nextPeak.hour <= currentHour) {
        nextTime.setDate(nextTime.getDate() + 1);
      }
      
      return {
        time: nextTime.toISOString(),
        hour: nextPeak.hour,
        expectedScore: Math.round(nextPeak.averageScore),
        confidence: nextPeak.confidence
      };
    }
    
    return null;
  }

  /**
   * Load peak periods from storage (if available)
   */
  async loadPeakPeriods() {
    try {
      // In a browser environment, use localStorage
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('availability_peak_periods');
        if (stored) {
          const data = JSON.parse(stored);
          this.peakPeriods = new Map(data);
        }
      }
    } catch (error) {
      console.warn('Could not load peak periods:', error);
    }
  }

  /**
   * Save peak periods to storage
   */
  async savePeakPeriods() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = Array.from(this.peakPeriods.entries());
        localStorage.setItem('availability_peak_periods', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Could not save peak periods:', error);
    }
  }

  /**
   * Utility functions
   */
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getStatusText(score) {
    if (score > 0.7) return 'highly_available';
    if (score > 0.4) return 'moderately_available';
    return 'low_availability';
  }

  /**
   * Gemini-specific helper functions
   */
  
  // Function for Gemini to get a simple availability check
  async isUserAvailable() {
    const result = await this.getAvailability();
    return result.success && result.data.availabilityScore > 50;
  }

  // Function for Gemini to get availability summary
  async getAvailabilitySummary() {
    const result = await this.getAvailability();
    if (!result.success) return "Unable to determine availability";
    
    const data = result.data;
    return `User is ${data.status.replace('_', ' ')} (${data.availabilityScore}% available). ` +
           `Next optimal time: ${data.nextOptimalTime ? new Date(data.nextOptimalTime.time).toLocaleTimeString() : 'Unknown'}. ` +
           `Licensed to ${this.attribution.owner}.`;
  }

  // Function for Gemini to understand when to defer requests
  async shouldDeferRequest() {
    const result = await this.getAvailability();
    if (!result.success) return false;
    
    return result.data.availabilityScore < 30;
  }

  // Function to get recommendations for Gemini
  async getRecommendations() {
    const result = await this.getAvailability();
    if (!result.success) return ["Unable to provide recommendations"];
    
    const data = result.data;
    const recommendations = [];
    
    if (data.availabilityScore > 70) {
      recommendations.push("User is highly available - proceed with complex requests");
    } else if (data.availabilityScore > 40) {
      recommendations.push("User is moderately available - simple requests recommended");
    } else {
      recommendations.push("User has low availability - consider deferring non-urgent requests");
    }
    
    if (data.nextOptimalTime) {
      recommendations.push(`Next optimal time: ${new Date(data.nextOptimalTime.time).toLocaleString()}`);
    }
    
    recommendations.push(`Data licensed to ${this.attribution.owner} (${this.attribution.websites.join(', ')})`);
    
    return recommendations;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdaptiveAvailabilityGem;
} else if (typeof window !== 'undefined') {
  window.AdaptiveAvailabilityGem = AdaptiveAvailabilityGem;
}

// Initialize the gem
const availabilityGem = new AdaptiveAvailabilityGem();

// Export for Gemini
if (typeof gem !== 'undefined') {
  gem.availability = availabilityGem;
}
