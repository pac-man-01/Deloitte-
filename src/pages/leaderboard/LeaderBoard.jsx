import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
 
const LeaderBoard = () => {
  const [leaders, setLeaders] = useState([]);
 
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        // Assumes your API returns an array of users with at least {name, email, learning_hours, role}
        const response = await axios.get('http://localhost:8000/api/leaderboard');
        // Only include users whose role is not 'admin'
        const employees = response.data.filter(user => user.role && user.role.toLowerCase() !== 'admin');
        setLeaders(employees);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaders();
  }, []);
 
  return (
    <div className="p-12 sm:p-16 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-semibold mb-12 text-center text-gray-900 dark:text-white">Top 10 Learners</h1>
      <div className="grid gap-6 max-w-3xl mx-auto">
        {leaders.slice(0, 10).map((user, index) => (
          <Card
            key={user.email}
            className="flex items-center justify-between px-8 py-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-6 min-w-0">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 w-8 text-right shrink-0">{index + 1}.</div>
              <div className="text-lg text-gray-800 dark:text-gray-100 truncate">{user.name}</div>
              {/* Optionally show the role for debug (remove in production) */}
              {/* <div className="ml-4 text-sm text-gray-400">{user.role}</div> */}
            </div>
            <div className="text-lg font-medium text-gray-600 dark:text-gray-300 ml-12 flex-shrink-0">{user.learning_hours} hrs</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
 
export default LeaderBoard;