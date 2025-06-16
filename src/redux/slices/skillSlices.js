import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courses: [
    {
      tech_skill: 'Full-stack ABAP integration',
      skill_set: 'ABAP',
      levels: ['Intermediate'],
    },
  ],
};

export const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    addCourse: (state, action) => {
      state.courses.push({
        tech_skill: action.payload.tech_skill,
        skill_set: action.payload.skill_set,
        levels: action.payload.levels,
      });
    },
    resetCourses: (state) => {
      state.courses = [...initialState.courses]; // resets to initial fixed course
    },
  },
});

export const { addCourse, resetCourses } = courseSlice.actions;

export default courseSlice.reducer;
