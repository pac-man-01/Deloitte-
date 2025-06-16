// baseQueryWithReauth.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "./getBaseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseURL()}/api`,
  credentials: "include",
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Refresh token logic here
    console.log("Expired");
    const refreshResult = await fetchBaseQuery({
      baseUrl: getBaseURL(),
      credentials: "include",
    })({ url: "/token/refresh", method: "POST" }, api, extraOptions);

    if (refreshResult?.error) {
      api.dispatch({ type: "auth/logout" });
      return result;
    }

    // Retry original query
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};
