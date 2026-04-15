import axios from 'axios';

// Use window.location.hostname so that if you connect via a mobile device (e.g. 192.168.1.x),
// the frontend will try to hit the backend on that same exact IP instead of resolving back to the phone's 'localhost'
const backendUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Student Auth ────────────────────────────────────────────────

export const register = async (username) => {
  const response = await api.post('/users/', { username });
  return response.data;
};

export const getUser = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const deleteUser = async (username) => {
  const response = await api.delete(`/users/${username}`);
  return response.data;
};

export const getAllStudents = async () => {
  const response = await api.get('/users/all');
  return response.data;
};

export const getLeaderboard = async (limit = 20) => {
  const response = await api.get(`/users/leaderboard?limit=${limit}`);
  return response.data;
};

// ─── Teacher Auth ────────────────────────────────────────────────

export const teacherRegister = async (username, password) => {
  const response = await api.post('/auth/teacher/register', { username, password });
  return response.data;
};

export const teacherLogin = async (username, password) => {
  const response = await api.post('/auth/teacher/login', { username, password });
  return response.data;
};

// ─── Circuits ────────────────────────────────────────────────────

import { saveCircuitOffline } from './offlineSync';

export const saveCircuit = async (circuitData, userId) => {
  if (!navigator.onLine) {
     await saveCircuitOffline(circuitData);
     return { ...circuitData, message: "Saved offline. Will sync when connected." };
  }
  
  try {
     const response = await api.post(`/circuits/?user_id=${userId}`, circuitData);
     return response.data;
  } catch (error) {
     if (error.message === 'Network Error') {
        await saveCircuitOffline(circuitData);
        return { ...circuitData, message: "Network error. Saved offline. Will sync when connected." };
     }
     throw error;
  }
};

export const getCircuits = async (username) => {
  const response = await api.get(`/users/${username}/circuits`);
  return response.data;
};

export const gradeCircuit = async (circuitData) => {
  const response = await api.post('/circuits/grade', circuitData);
  return response.data;
};

export const deleteCircuit = async (id) => {
  const response = await api.delete(`/circuits/${id}`);
  return response.data;
};

export const renameCircuit = async (id, name) => {
  const response = await api.put(`/circuits/${id}/name`, { name });
  return response.data;
};

// ─── Challenges ───────────────────────────────────────────────────

export const getChallenges = async () => {
  const response = await api.get('/challenges/');
  return response.data;
};

// ─── Classrooms ───────────────────────────────────────────────────

export const createClassroom = async (teacherUsername, name) => {
  const response = await api.post(`/classrooms/${encodeURIComponent(teacherUsername)}`, { name });
  return response.data;
};

export const getTeacherClassrooms = async (teacherUsername) => {
  const response = await api.get(`/classrooms/teacher/${encodeURIComponent(teacherUsername)}`);
  return response.data;
};

export const getTeacherStudents = async (teacherUsername) => {
  const response = await api.get(`/classrooms/teacher/${encodeURIComponent(teacherUsername)}/students`);
  return response.data;
};

export const joinClassroom = async (joinCode, studentUsername) => {
  const response = await api.post('/classrooms/join', {
    join_code: joinCode,
    student_username: studentUsername
  });
  return response.data;
};

export const updateClassroom = async (classroomId, data) => {
  const response = await api.put(`/classrooms/${classroomId}`, data);
  return response.data;
};

export const deleteClassroom = async (classroomId) => {
  const response = await api.delete(`/classrooms/${classroomId}`);
  return response.data;
};

export const getStudentClassrooms = async (studentUsername) => {
  const response = await api.get(`/classrooms/student/${encodeURIComponent(studentUsername)}`);
  return response.data;
};

export const getClassroomStudents = async (classroomId) => {
  const response = await api.get(`/classrooms/${classroomId}/students`);
  return response.data;
};

export const getClassroomEnrollments = async (classroomId) => {
  const response = await api.get(`/classrooms/${classroomId}/enrollments`);
  return response.data;
};

export const unenrollStudent = async (classroomId, studentUsername) => {
  const response = await api.delete(`/classrooms/${classroomId}/students/${encodeURIComponent(studentUsername)}`);
  return response.data;
};

export const approveStudent = async (classroomId, studentUsername) => {
  const response = await api.put(`/classrooms/${classroomId}/enrollments/${encodeURIComponent(studentUsername)}/approve`);
  return response.data;
};

// ─── Assignments ──────────────────────────────────────────────────

export const getAssignments = async (studentUsername) => {
  const url = studentUsername ? `/assignments/student/${encodeURIComponent(studentUsername)}` : '/assignments/';
  const response = await api.get(url);
  return response.data;
};

export const getAssignmentsByTeacher = async (username) => {
  const response = await api.get(`/assignments/teacher/${username}`);
  return response.data;
};

export const createAssignment = async (data, teacherUsername) => {
  const response = await api.post(`/assignments/?teacher_username=${encodeURIComponent(teacherUsername)}`, data);
  return response.data;
};

export const updateAssignment = async (id, data, teacherUsername) => {
  const response = await api.patch(
    `/assignments/${id}?teacher_username=${encodeURIComponent(teacherUsername)}`,
    data
  );
  return response.data;
};

export const deleteAssignment = async (id, teacherUsername) => {
  const response = await api.delete(
    `/assignments/${id}?teacher_username=${encodeURIComponent(teacherUsername)}`
  );
  return response.data;
};

// ─── Submissions ──────────────────────────────────────────────────

export const submitCircuit = async ({ assignmentId, studentUsername, circuitData }) => {
  const response = await api.post('/submissions/', {
    assignment_id: assignmentId,
    student_username: studentUsername,
    circuit_data: circuitData,
  });
  return response.data;
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  const response = await api.get(`/submissions/assignment/${assignmentId}`);
  return response.data;
};

export const getSubmissionsByStudent = async (username) => {
  const response = await api.get(`/submissions/student/${username}`);
  return response.data;
};

export const gradeSubmission = async (submissionId, { teacherScore, teacherFeedback }) => {
  const response = await api.patch(`/submissions/${submissionId}/grade`, {
    teacher_score: teacherScore,
    teacher_feedback: teacherFeedback,
  });
  return response.data;
};

export default api;
