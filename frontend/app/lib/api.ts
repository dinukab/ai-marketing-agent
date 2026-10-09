const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Registration failed");
  }

  return result;
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Login failed");
  }

  return result;
}

export async function forgotPassword(data: { email: string }) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to send reset link");
  }

  return result;
}

export async function resetPassword(data: { token: string; new_password: string }) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to reset password");
  }

  return result;
}

export async function fetchReviews(
  businessId?: number, 
  search?: string, 
  sentiment?: string,
  rating?: number,
  sort?: string,
  dateRange?: string
) {
  const queryParams = new URLSearchParams();
  if (businessId) queryParams.append('business_id', businessId.toString());
  if (search) queryParams.append('search', search);
  if (sentiment && sentiment !== 'all') queryParams.append('sentiment', sentiment);
  if (rating && rating > 0) queryParams.append('rating', rating.toString());
  if (sort && sort !== 'newest') queryParams.append('sort', sort);
  if (dateRange && dateRange !== '30days') queryParams.append('date_range', dateRange);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/api/reviews${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to fetch reviews");
  }

  return result;
}

export async function fetchReviewStats(businessId?: number) {
  const queryParams = new URLSearchParams();
  if (businessId) queryParams.append('business_id', businessId.toString());
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/api/reviews/stats${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to fetch review stats");
  }

  return result;
}

export async function seedReviews(businessId: number) {
  const response = await fetch(`${API_URL}/api/reviews/seed?business_id=${businessId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to seed reviews");
  }

  return result;
}