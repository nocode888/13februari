import type { MetaAudience } from '../types/meta';

export class AnalysisService {
  static calculateAudienceMetrics(
    audiences: MetaAudience[],
    filters: Record<string, string>
  ) {
    // Base calculations
    const totalReach = audiences.reduce((sum, audience) => sum + audience.size, 0);
    
    // Apply age filter adjustments
    const ageMin = parseInt(filters.age_min);
    const ageMax = parseInt(filters.age_max);
    const ageRangeMultiplier = Math.min(1, (ageMax - ageMin) / 100);
    
    // Apply gender filter adjustments
    const genderMultiplier = filters.gender === 'all' ? 1 : 0.5;
    
    // Apply budget adjustments
    const budgetMin = parseInt(filters.budget_min);
    const budgetMax = parseInt(filters.budget_max);
    const avgBudget = (budgetMin + budgetMax) / 2;
    const budgetMultiplier = Math.min(1, avgBudget / 100);
    
    // Calculate adjusted reach
    const adjustedReach = totalReach * ageRangeMultiplier * genderMultiplier * budgetMultiplier;
    
    // Calculate overlap based on number of interests
    const overlapPercentage = Math.min(0.3 * audiences.length, 0.7);
    const estimatedOverlap = Math.floor(adjustedReach * overlapPercentage);
    
    // Calculate effectiveness score
    const effectivenessScore = Math.min(100, Math.floor(
      (audiences.length * 20) +
      (ageRangeMultiplier * 30) +
      (genderMultiplier * 25) +
      (budgetMultiplier * 25)
    ));
    
    return {
      totalReach: adjustedReach,
      overlap: estimatedOverlap,
      effectiveness: effectivenessScore,
      metrics: {
        ageRange: {
          value: `${ageMin}-${ageMax}`,
          impact: ageRangeMultiplier
        },
        gender: {
          value: filters.gender,
          impact: genderMultiplier
        },
        budget: {
          value: `${budgetMin}-${budgetMax}`,
          impact: budgetMultiplier
        }
      }
    };
  }

  static getEffectivenessLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Low';
  }

  static getRecommendations(
    metrics: ReturnType<typeof AnalysisService.calculateAudienceMetrics>
  ): string[] {
    const recommendations: string[] = [];

    // Age-based recommendations
    if (metrics.metrics.ageRange.impact < 0.5) {
      recommendations.push('Consider broadening your age range for better reach');
    }

    // Gender-based recommendations
    if (metrics.metrics.gender.impact < 1) {
      recommendations.push('Your gender targeting may be limiting your audience size');
    }

    // Budget-based recommendations
    if (metrics.metrics.budget.impact < 0.5) {
      recommendations.push('Increasing your budget could improve campaign performance');
    }

    // Overlap-based recommendations
    const overlapRatio = metrics.overlap / metrics.totalReach;
    if (overlapRatio > 0.6) {
      recommendations.push('High audience overlap detected - consider diversifying interests');
    } else if (overlapRatio < 0.2) {
      recommendations.push('Low audience overlap - your targeting may be too broad');
    }

    return recommendations;
  }
}