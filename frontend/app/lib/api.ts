const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BusinessSummary {
  id: number;
  name: string;
  location?: string | null;
  ai_tone?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  businesses: BusinessSummary[];
}

export interface ReviewItem {
  id: number;
  business_id: number;
  google_review_id?: string | null;
  customer_name?: string | null;
  customer_avatar?: string | null;
  rating: number;
  review_text?: string | null;
  review_date?: string | null;
  sentiment?: string | null;
  sentiment_score?: number | null;
  topics?: string[] | null;
  ai_response?: string | null;
  response_status?: string | null;
  source?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedReviews {
  items: ReviewItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ReviewStats {
  total_reviews: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_rating: number;
  awaiting_response_count: number;
  answered_count: number;
  rating_distribution: Record<number, number>;
}

export interface ReplyActionResponse {
  message: string;
  review_id: number;
  reply: string | null;
  response_status: string | null;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure HTTP-only access_token cookie is always sent and received
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    if (data?.detail) {
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        errorMessage = data.detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join(", ");
      }
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (response.statusText) {
      errorMessage = response.statusText;
    }
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<UserProfile>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  return apiFetch<{
    access_token: string;
    token_type: string;
    user: { id: number; name: string; email: string };
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/auth/me", {
    method: "GET",
  });
}

export async function logoutUser() {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function forgotPassword(data: { email: string }) {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: { token: string; new_password: string }) {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchReviews(
  businessId?: number,
  search?: string,
  sentiment?: string,
  rating?: number,
  sort?: string,
  dateRange?: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedReviews> {
  const queryParams = new URLSearchParams();
  if (businessId) queryParams.append("business_id", businessId.toString());
  if (search) queryParams.append("search", search);
  if (sentiment && sentiment !== "all") queryParams.append("sentiment", sentiment);
  if (rating && rating > 0) queryParams.append("rating", rating.toString());
  if (sort && sort !== "newest") queryParams.append("sort", sort);
  if (dateRange && dateRange !== "all") queryParams.append("date_range", dateRange);
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const queryString = queryParams.toString();
  return apiFetch<PaginatedReviews>(`/api/reviews${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
  });
}

export async function fetchReviewStats(businessId?: number): Promise<ReviewStats> {
  const queryParams = new URLSearchParams();
  if (businessId) queryParams.append("business_id", businessId.toString());

  const queryString = queryParams.toString();
  return apiFetch<ReviewStats>(`/api/reviews/stats${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
  });
}

export async function seedReviews(businessId: number): Promise<ReviewItem[]> {
  return apiFetch<ReviewItem[]>(`/api/reviews/seed?business_id=${businessId}`, {
    method: "POST",
  });
}

/**
 * Generate an AI-powered personalized reply draft using Gemini
 * Calls FastAPI backend: POST /api/reviews/{review_id}/generate-reply
 */
export async function generateReviewReply(
  reviewId: number,
  tone?: string
): Promise<ReplyActionResponse> {
  return apiFetch<ReplyActionResponse>(`/api/reviews/${reviewId}/generate-reply`, {
    method: "POST",
    body: JSON.stringify(tone ? { tone } : {}),
  });
}

/**
 * Edit the drafted AI reply for a review
 * Calls FastAPI backend: PATCH /api/reviews/{review_id}/edit-reply
 */
export async function editReviewReply(
  reviewId: number,
  reply: string
): Promise<ReplyActionResponse> {
  return apiFetch<ReplyActionResponse>(`/api/reviews/${reviewId}/edit-reply`, {
    method: "PATCH",
    body: JSON.stringify({ reply }),
  });
}

/**
 * Approve an AI reply draft
 * Calls FastAPI backend: POST /api/reviews/{review_id}/approve-reply
 */
export async function approveReviewReply(
  reviewId: number
): Promise<ReplyActionResponse> {
  return apiFetch<ReplyActionResponse>(`/api/reviews/${reviewId}/approve-reply`, {
    method: "POST",
  });
}

/**
 * Reject an AI reply draft
 * Calls FastAPI backend: POST /api/reviews/{review_id}/reject-reply
 */
export async function rejectReviewReply(
  reviewId: number
): Promise<ReplyActionResponse> {
  return apiFetch<ReplyActionResponse>(`/api/reviews/${reviewId}/reject-reply`, {
    method: "POST",
  });
}

/**
 * Trigger sentiment analysis for a specific review
 * Calls FastAPI backend: POST /api/reviews/{review_id}/analyze
 */
export async function analyzeReview(reviewId: number) {
  return apiFetch<any>(`/api/reviews/${reviewId}/analyze`, {
    method: "POST",
  });
}

// ============================================================================
// Analytics API Helpers (Analysis Page)
// ============================================================================

export interface AnalyticsOverviewData {
  business_id: number;
  timeframe: string;
  total_reviews: number;
  average_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
  unanalyzed_reviews: number;
  unanswered_reviews: number;
  reply_coverage_percentage: number;
  rating_change?: number | null;
  review_count_change?: number | null;
}

export interface SentimentDistributionData {
  business_id: number;
  timeframe: string;
  total_analyzed: number;
  positive: number;
  neutral: number;
  negative: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  items: Array<{
    name: string;
    count: number;
    percentage: number;
    color?: string | null;
  }>;
  emotions: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
}

export interface ReviewTrendsData {
  business_id: number;
  timeframe: string;
  rating_trends: Array<{
    period: string;
    date?: string | null;
    average_rating: number;
    count: number;
  }>;
  volume_trends: Array<{
    period: string;
    date?: string | null;
    current: number;
    previous?: number | null;
  }>;
  sentiment_trends: Array<{
    period: string;
    date?: string | null;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  }>;
}

export interface TopicsAndIssuesData {
  business_id: number;
  timeframe: string;
  topics: Array<{
    name: string;
    count: number;
    percentage: number;
    is_positive: boolean;
    sentiment?: string | null;
  }>;
  issues: Array<{
    issue: string;
    count: number;
    percentage: number;
    severity?: string | null;
    status?: string | null;
  }>;
  total_topics_detected: number;
  total_issues_detected: number;
}

export interface ReplyPerformanceData {
  business_id: number;
  timeframe: string;
  total_reviews: number;
  replied_count: number;
  unanswered_count: number;
  reply_coverage_percentage: number;
  average_response_time_hours?: number | null;
  ai_generated_replies_count: number;
  manual_replies_count: number;
  rating_tier_breakdown: Array<{
    rating_group: string;
    total_reviews: number;
    replied_count: number;
    unreplied_count: number;
    response_rate: number;
    avg_response_hours?: number | null;
  }>;
}

export interface AiBusinessInsightsData {
  business_id: number;
  timeframe: string;
  executive_summary: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommended_actions: string[];
  insights: Array<{
    id?: string | null;
    category: string;
    insight_type: string;
    priority: string;
    title: string;
    description: string;
    actionable_recommendation?: string | null;
    supporting_review_ids: number[];
  }>;
  generated_at?: string;
}

export interface RatingDistributionData {
  business_id: number;
  timeframe?: string;
  average_rating: number;
  total_reviews: number;
  star_1: number;
  star_2: number;
  star_3: number;
  star_4: number;
  star_5: number;
  breakdown: Record<number, number>;
  items: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

export interface AnalyticsDashboardData {
  business_id: number;
  timeframe: string;
  overview: AnalyticsOverviewData;
  sentiment_distribution: SentimentDistributionData;
  rating_distribution: RatingDistributionData;
  trends: ReviewTrendsData;
  topics: TopicsAndIssuesData["topics"];
  issues: TopicsAndIssuesData["issues"];
  topics_and_issues?: TopicsAndIssuesData;
  reply_performance?: ReplyPerformanceData | null;
  ai_insights?: AiBusinessInsightsData | null;
}

export async function fetchRatingDistribution(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<RatingDistributionData>(`/api/analytics/rating-distribution?${params.toString()}`);
}

export async function fetchAnalyticsOverview(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<AnalyticsOverviewData>(`/api/analytics/overview?${params.toString()}`);
}

export async function fetchSentimentDistribution(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<SentimentDistributionData>(`/api/analytics/sentiment?${params.toString()}`);
}

export async function fetchReviewTrends(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<ReviewTrendsData>(`/api/analytics/trends?${params.toString()}`);
}

export async function fetchTopicsAndIssues(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<TopicsAndIssuesData>(`/api/analytics/topics-and-issues?${params.toString()}`);
}

export async function fetchReplyPerformance(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<ReplyPerformanceData>(`/api/analytics/reply-performance?${params.toString()}`);
}

export async function fetchAiBusinessInsights(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<AiBusinessInsightsData>(`/api/analytics/ai-insights?${params.toString()}`);
}

export async function fetchAnalyticsDashboard(businessId?: number, timeframe: string = "30days") {
  const params = new URLSearchParams({ timeframe });
  if (businessId) params.append("business_id", businessId.toString());
  return apiFetch<AnalyticsDashboardData>(`/api/analytics/dashboard?${params.toString()}`);
}