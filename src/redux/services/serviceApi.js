// Need to use the React-specific entry point to import createApi
import { baseQueryWithReauth } from "@/utils/baseQueryWithReauth";
import { getBaseURL } from "@/utils/getBaseURL";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SKILLS"],
  endpoints: (builder) => ({
    fetchSkills: builder.mutation({
      query: (data) => ({
        url: "/skills",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { resource_id: data },
      }),
    }),

    fetchCourses: builder.mutation({
      query: (data) => {
        return {
          url: "/courses",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
        };
      },
    }),

    fetchScrapeCourses: builder.mutation({
      query: (data) => {
        return {
          url: "/scrape-courses",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
        };
      },
    }),

    getUserDetails: builder.mutation({
      query: (email) => ({
        url: "/profile",
        method: "POST",
        body: { email }, // explicitly sending a JSON object with "email"
      }),
    }),


    fetchLearnerID: builder.mutation({
      query: (email) => ({
        url: 'learner',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { email: email },
      }),
    }),

    fetchCourseHistory: builder.mutation({
      query: (learnerId) => ({
        url: '/course-history',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { learnerId:learnerId },
      }),
    }),


  }),
});

export const {
  useFetchSkillsMutation,
  useFetchCoursesMutation,
  useFetchScrapeCoursesMutation,
  useGetUserDetailsMutation,
  useFetchLearnerIDMutation,
  useFetchCourseHistoryMutation
} = serviceApi;

export default serviceApi;
