import { configureStore } from '@reduxjs/toolkit'
import serviceApi from '../services/serviceApi'
import courseReducer from '../slices/skillSlices';
import selectedCourseReducer from '../slices/selectedCourseSlice';


export const store = configureStore({
    reducer: {
        courses:courseReducer,
        selectedSkill:selectedCourseReducer,
        [serviceApi.reducerPath]: serviceApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(serviceApi.middleware),
})

export default store;