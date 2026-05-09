import axios from 'axios';

// Use relative path so Vite proxy (or production server) can route it to the backend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Student Auth ────────────────────────────────────────────────

export const register = async (username, email, password) => {
  const response = await api.post('/users/', { username, email, password });
  const data = response.data;
  // Cache profile on register
  await saveUserProfile(data);
  return data;
};

export const getUser = async (username) => {
  try {
    const response = await api.get(`/users/${username}`);
    const data = response.data;
    // Update offline manual sync cache
    await saveUserProfile(data);
    return data;
  } catch (error) {
    const cached = await getCachedUser(username);
    if (cached) return cached;
    throw error;
  }
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

export const teacherRegister = async (username, email, password) => {
  const response = await api.post('/auth/teacher/register', { username, email, password });
  return response.data;
};

export const teacherLogin = async (username, password, device_token) => {
  const response = await api.post('/auth/teacher/login', { username, password, device_token });
  return response.data;
};

// ─── Unified Auth (New) ──────────────────────────────────────────

export const unifiedLogin = async (username, password, device_token) => {
  const response = await api.post('/auth/login', { username, password, device_token });
  return response.data;
};

export const verifyDevice = async (username, code, device_token) => {
  const response = await api.post('/auth/verify', { username, code, device_token });
  return response.data;
};

export const changePassword = async (username, old_password, new_password) => {
  const response = await api.put('/auth/change-password', { username, old_password, new_password });
  return response.data;
};

// ─── Circuits ────────────────────────────────────────────────────

import { saveCircuitOffline, getOfflineCircuits, getCachedUser, saveUserProfile } from './offlineSync';

export const saveCircuit = async (circuitData, userId) => {
  if (!navigator.onLine) {
    await saveCircuitOffline(circuitData);
    return { ...circuitData, message: "Saved offline. Will sync when connected." };
  }

  try {
    const response = await api.post(`/circuits/?user_id=${userId}`, circuitData);
    return response.data;
  } catch (error) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
      await saveCircuitOffline(circuitData);
      return { ...circuitData, message: "Network error. Saved offline. Will sync when connected." };
    }
    throw error;
  }
};

export const getCircuits = async (username) => {
  const localCircuits = await getOfflineCircuits();

  try {
    const response = await api.get(`/users/${username}/circuits`);
    const remoteCircuits = response.data;

    // Combine remote with local-only (unsynced) circuits
    // Note: This is an additive merge for visibility.
    return [...remoteCircuits, ...localCircuits];
  } catch (error) {
    // If offline and workbox cache also fails, fallback gracefully to returning local-only circuits
    return localCircuits;
  }
};

export const syncCircuitToCloud = async (circuit, userId) => {
  const response = await api.post(`/circuits/?user_id=${userId}`, circuit);
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

export const regenerateJoinCode = async (classroomId) => {
  const response = await api.post(`/classrooms/${classroomId}/regenerate-code`);
  return response.data;
};

// ─── Assignments ──────────────────────────────────────────────────

export const getAssignments = async (studentUsername) => {
  const url = studentUsername ? `/assignments/student/${encodeURIComponent(studentUsername)}` : '/assignments/';
  const response = await api.get(url);
  return response.data;
};

export const dismissAssignment = async (assignmentId, studentUsername) => {
  const response = await api.post(`/assignments/${assignmentId}/dismiss?username=${encodeURIComponent(studentUsername)}`);
  return response.data;
};

export const resetDismissedAssignments = async (studentUsername) => {
  const response = await api.delete(`/assignments/dismissed/reset?username=${encodeURIComponent(studentUsername)}`);
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

export const deleteSubmission = async (id, username) => {
  const response = await api.delete(`/submissions/${id}?username=${encodeURIComponent(username)}`);
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
