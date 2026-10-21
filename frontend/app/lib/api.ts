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