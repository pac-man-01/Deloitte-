import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCourse: {
    tech_skill: '',
    skill_set: '',
    levels: [],
  },
};

export const selectedCourseSlice = createSlice({
  name: 'selectedCourse',
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = {
        tech_skill: '',
        skill_set: '',
        levels: [],
      };
    },
  },
});

export const { setSelectedCourse, clearSelectedCourse } = selectedCourseSlice.actions;

export default selectedCourseSlice.reducer;
