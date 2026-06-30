import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiFileText, FiUser, FiCalendar, FiClock,
  FiUpload, FiCheckCircle, FiAlertCircle, FiDownload,
  FiEdit, FiSave, FiX, FiEye, FiPaperclip, FiList,
  FiType, FiFile, FiCheckSquare
} from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [_editing, setEditing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`${API_BASE}/api/students/assignments/${id}/`);
      if (!response.ok) throw new Error('Failed to fetch assignment');
      const data = await response.json();
      console.log('Assignment data:', data);
      setAssignment(data);
      
      // Initialize answers if submission exists
      if (data.submission && data.submission.answers) {
        const answerMap = {};
        data.submission.answers.forEach(ans => {
          answerMap[ans.question_id] = ans.answer_text || ans.selected_option || '';
        });
        setAnswers(answerMap);
        setSubmission(data.submission);
      } else if (data.questions) {
        // Initialize empty answers for all questions
        const emptyAnswers = {};
        data.questions.forEach(q => {
          emptyAnswers[q.id] = '';
        });
        setAnswers(emptyAnswers);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, API_BASE, id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  const formData = new FormData();
  
  // Add all answers
  Object.keys(answers).forEach(key => {
    if (answers[key]) {
      formData.append(`answers[${key}]`, answers[key]);
    }
  });
  
  // Add file if selected
  if (selectedFile) {
    formData.append(`file_${selectedFile.questionId}`, selectedFile.file);
  }
  
  formData.append('status', 'Submitted');

  try {
    const response = await authenticatedFetch(`${API_BASE}/api/students/assignments/${id}/submit/`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header - let browser set it with boundary
      },
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submission error:', errorText);
      throw new Error(`Submission failed: ${response.status}`);
    }
    
    const result = await response.json();
    toast.success('Assignment submitted successfully!');
    setSubmission(result.submission);
    setEditing(false);
    setSelectedFile(null);
    fetchAssignment();
  } catch (error) {
    console.error('Error submitting assignment:', error);
    toast.error('Failed to submit assignment. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Graded': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Late': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'Draft': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'essay': return <FiType className="text-purple-500" />;
      case 'text': return <FiType className="text-blue-500" />;
      case 'multiple_choice': return <FiCheckSquare className="text-green-500" />;
      case 'true_false': return <FiCheckSquare className="text-orange-500" />;
      default: return <FiFileText className="text-gray-500" />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'essay': return 'Essay';
      case 'text': return 'Text Answer';
      case 'multiple_choice': return 'Multiple Choice';
      case 'true_false': return 'True/False';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <FiAlertCircle className="text-5xl mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assignment Not Found</h2>
          <button
            onClick={() => navigate('/student/academics/assignments')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FiArrowLeft /> Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = submission?.status === 'Submitted' || submission?.status === 'Graded';
  const isGraded = submission?.status === 'Graded';

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/academics/assignments')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition mb-4"
        >
          <FiArrowLeft /> Back to Assignments
        </button>

        {/* Assignment Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-indigo-500" />
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {assignment.title}
                  </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {assignment.course_code} - {assignment.course_title}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission?.status || 'Not Submitted')}`}>
                {submission?.status || 'Not Submitted'}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FiUser className="text-xs" />
                Teacher: {assignment.teacher || 'TBA'}
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-xs" />
                Posted: {new Date(assignment.publish_date).toLocaleDateString()}
              </div>
              {assignment.due_date && (
                <div className="flex items-center gap-2">
                  <FiClock className="text-xs" />
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <FiList className="text-xs" />
                Questions: {assignment.questions?.length || 0} | Total Points: {assignment.total_points || 0}
              </div>
            </div>

            {assignment.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <FiList />
              Questions ({assignment.questions?.length || 0})
            </h2>

            {isGraded ? (
              // Show Graded View
              <div className="space-y-4">
                {assignment.questions?.map((question, index) => {
                  const answer = submission?.answers?.find(a => a.question_id === question.id);
                  return (
                    <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Q{index + 1}.
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {question.question_text}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-xs">
                              {getQuestionTypeLabel(question.question_type)}
                            </span>
                            <span className="ml-2">Points: {question.points}</span>
                          </div>
                          {answer && (
                            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Your Answer:</span> {answer.answer_text || 'File uploaded'}
                              </p>
                              {answer.score !== null && (
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Score: {answer.score}/{question.points}
                                </p>
                              )}
                              {answer.feedback && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Feedback: {answer.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isSubmitted ? (
              // Show Submitted State
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Submitted Successfully</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Submitted on: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <FiCheckCircle className="text-blue-500 text-3xl" />
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <FiEdit /> Resubmit
                </button>
              </div>
            ) : (
              // Submission Form with Questions
              <form onSubmit={handleSubmit} className="space-y-6">
                {assignment.questions?.map((question, index) => (
                  <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getQuestionTypeIcon(question.question_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Q{index + 1}. {question.question_text}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({getQuestionTypeLabel(question.question_type)} • {question.points} pts)
                          </span>
                        </div>

                        {/* Question Input based on type */}
                        <div className="mt-3">
                          {question.question_type === 'essay' && (
                            <div>
                              <textarea
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
                                rows="6"
                                placeholder="Write your essay here..."
                                disabled={isSubmitted}
                              />
                              {question.min_words && question.max_words && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Min: {question.min_words} words • Max: {question.max_words} words
                                </p>
                              )}
                            </div>
                          )}

                          {question.question_type === 'text' && (
                            <div>
                              <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="Type your answer here..."
                                disabled={isSubmitted}
                              />
                            </div>
                          )}

                          {question.question_type === 'multiple_choice' && (
                            <div className="space-y-2">
                              {question.options?.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                  <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option.label}
                                    checked={answers[question.id] === option.label}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    disabled={isSubmitted}
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {option.label}. {option.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {question.question_type === 'true_false' && (
                            <div className="flex gap-4">
                              {question.options?.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex-1 justify-center">
                                  <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option.label}
                                    checked={answers[question.id] === option.label}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    disabled={isSubmitted}
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {option.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!isSubmitted && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave />
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
