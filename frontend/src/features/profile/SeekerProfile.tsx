import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { api } from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  StarIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
} from '../../components/icons';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_year: number;
  gpa: string;
  achievements: string[];
  // UI-only helpers (not persisted)
  institution_other?: string;
  field_of_study_other?: string;
}

interface WorkExperience {
  company: string;
  position: string;
  start_date: string; // yyyy-mm-dd
  end_date: string;   // yyyy-mm-dd
  current: boolean;
  description: string;
  achievements: string[];
  skills_used: string[];
}

interface Certification {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
}

interface Language {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

interface JobPreferences {
  job_types: string[];
  work_locations: string[];
  salary_expectation: {
    min: number;
    max: number;
    currency: string;
  };
  availability: string;
  remote_preference: string;
}

interface SeekerProfile {
  name: string;
  email: string;
  bio: string;
  phone: string;
  skills: string[];
  linkedin: string;
  address: string;
  cv_url: string;
  profile_image: string;
  education: Education[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  languages: Language[];
  job_preferences: JobPreferences;
}

export function SeekerProfile() {
  const toDateInput = (val: any): string => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  // Reference data for dropdowns
  const RWANDA_UNIVERSITIES = [
    // Public / National
    'University of Rwanda (UR)',
    'Rwanda Polytechnic (RP)',
    'Institute of Legal Practice and Development (ILPD)',
    'IPRC Kigali',
    'IPRC Huye',
    'IPRC Musanze',
    'IPRC Tumba',
    'IPRC Karongi',
    'IPRC Ngoma',
    
    // Private and other universities
    'Adventist University of Central Africa (AUCA)',
    'African Leadership University (ALU Rwanda)',
    'University of Kigali (UoK)',
    'Kigali Independent University (ULK)',
    'University of Lay Adventists of Kigali (UNILAK)',
    'Carnegie Mellon University Africa (CMU-Africa)',
    'Catholic University of Rwanda (CUR)',
    'Institut Catholique de Kabgayi (ICK)',
    'Institut d’Enseignement Supérieur de Ruhengeri (INES-Ruhengeri)',
    'KIM University',
    'East African University Rwanda (EAUR)',
    'University of Technology and Arts of Byumba (UTAB)',
    'University of Tourism, Technology and Business Studies (UTB)',
    'University of Global Health Equity (UGHE)',
    'Kibogora Polytechnic',
    'Mount Kenya University – Kigali Campus'
  ];

  const DEGREE_LEVELS = ['High School', 'Associate', 'Bachelor', 'Master', 'PHD'];

  const FIELDS_OF_STUDY = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Data Science',
    'Artificial Intelligence',
    'Business Administration',
    'Finance',
    'Accounting',
    'Marketing',
    'Economics',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Public Health',
    'Medicine',
    'Nursing',
    'Education',
    'Law',
    'Environmental Science',
    'Agriculture'
  ];

  const YEARS: number[] = Array.from({ length: 2040 - 1980 + 1 }, (_, i) => 1980 + i);

  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SeekerProfile>({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    skills: [],
    linkedin: '',
    address: '',
    cv_url: '',
    profile_image: '',
    education: [],
    work_experience: [],
    certifications: [],
    languages: [],
    job_preferences: {
      job_types: [],
      work_locations: [],
      salary_expectation: { min: 0, max: 0, currency: 'RWF' },
      availability: 'immediate',
      remote_preference: 'flexible'
    }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingImage, setUploadingImage] = useState(false);

  const initials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || 'U';
  };

  const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
    if (!cloud || !preset) throw new Error('Cloudinary is not configured');
    const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', preset);
    const res = await fetch(url, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setMessage('');
    try {
      const imageUrl = await uploadAvatarToCloudinary(file);
      // Persist to backend
      await api.post('/users/me/image', { imageUrl });
      setProfile(prev => ({ ...prev, profile_image: imageUrl }));
      setMessage('Profile image updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage('Error uploading image. Please configure Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.user) {
        const u = response.data.user as Partial<SeekerProfile>;
        // Normalize server payload to ensure controlled inputs and safe maps
        setProfile(prev => ({
          ...prev,
          name: u.name ?? prev.name ?? '',
          email: u.email ?? prev.email ?? '',
          bio: u.bio ?? '',
          phone: u.phone ?? '',
          skills: Array.isArray(u.skills) ? u.skills : [],
          linkedin: u.linkedin ?? '',
          address: u.address ?? '',
          cv_url: u.cv_url ?? '',
          profile_image: u.profile_image ?? '',
          education: Array.isArray(u.education)
            ? u.education.map((edu: any) => {
                const rawYear = (edu?.graduation_year ?? '').toString();
                const parsed = parseInt(rawYear, 10);
                const fallbackYear = new Date().getFullYear();
                const normalizedYear = Number.isFinite(parsed) && YEARS.includes(parsed) ? parsed : fallbackYear;
                return {
                  institution: edu?.institution || '',
                  degree: edu?.degree || '',
                  field_of_study: edu?.field_of_study || '',
                  graduation_year: normalizedYear,
                  gpa: (edu?.gpa ?? '').toString(),
                  achievements: Array.isArray(edu?.achievements) ? edu.achievements : []
                } as Education;
              })
            : [],
          work_experience: Array.isArray(u.work_experience)
            ? u.work_experience.map((exp: any) => ({
                company: exp.company || '',
                position: exp.position || '',
                start_date: toDateInput(exp.start_date),
                end_date: exp.current ? '' : toDateInput(exp.end_date),
                current: !!exp.current,
                description: exp.description || '',
                achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
                skills_used: Array.isArray(exp.skills_used) ? exp.skills_used : []
              }))
            : [],
          certifications: Array.isArray(u.certifications) ? u.certifications : [],
          languages: Array.isArray(u.languages) ? u.languages : [],
          job_preferences: {
            job_types: Array.isArray(u.job_preferences?.job_types) ? u.job_preferences!.job_types : [],
            work_locations: Array.isArray(u.job_preferences?.work_locations) ? u.job_preferences!.work_locations : [],
            salary_expectation: {
              min: u.job_preferences?.salary_expectation?.min ?? 0,
              max: u.job_preferences?.salary_expectation?.max ?? 0,
              currency: u.job_preferences?.salary_expectation?.currency ?? 'RWF',
            },
            availability: u.job_preferences?.availability ?? 'immediate',
            remote_preference: u.job_preferences?.remote_preference ?? 'flexible',
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Basic validation: ensure required fields for education
      for (const edu of profile.education) {
        if (!edu.institution || !edu.institution.trim()) {
          setMessage('Please provide Institution for each education item.');
          setSaving(false);
          return;
        }
        if (!edu.degree || !edu.degree.trim()) {
          setMessage('Please select Degree for each education item.');
          setSaving(false);
          return;
        }
      }

      // Sanitize education entries before sending (strip UI-only helpers)
      const sanitizedEducation = profile.education.map((edu) => {
        const institution = RWANDA_UNIVERSITIES.includes(edu.institution)
          ? edu.institution
          : (edu.institution || edu.institution_other || '');
        const field = FIELDS_OF_STUDY.includes(edu.field_of_study)
          ? edu.field_of_study
          : (edu.field_of_study || edu.field_of_study_other || '');
        return {
          institution,
          degree: edu.degree,
          field_of_study: field,
          graduation_year: edu.graduation_year,
          gpa: edu.gpa,
          achievements: edu.achievements || []
        };
      });

      const payload = {
        ...profile,
        education: sanitizedEducation,
        work_experience: profile.work_experience.map((exp) => ({
          company: exp.company,
          position: exp.position,
          start_date: exp.start_date ? new Date(exp.start_date).toISOString() : undefined,
          end_date: exp.current || !exp.end_date ? undefined : new Date(exp.end_date).toISOString(),
          current: exp.current,
          description: exp.description,
          achievements: exp.achievements || [],
          skills_used: exp.skills_used || []
        }))
      };

      await api.put('/users/me', payload);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field_of_study: '',
        graduation_year: new Date().getFullYear(),
        gpa: '',
        achievements: []
      }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addWorkExperience = () => {
    setProfile(prev => ({
      ...prev,
      work_experience: [...prev.work_experience, {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        current: false,
        description: '',
        achievements: [],
        skills_used: []
      }]
    }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setProfile(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !profile.skills.includes(skill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, {
        language: '',
        proficiency: 'intermediate'
      }]
    }));
  };

  const updateLanguage = (index: number, field: keyof Language, value: any) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: UserIcon },
    { id: 'education', label: 'Education', icon: AcademicCapIcon },
    { id: 'experience', label: 'Experience', icon: BriefcaseIcon },
    { id: 'skills', label: 'Skills', icon: StarIcon },
    { id: 'preferences', label: 'Preferences', icon: StarIcon }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('profile')}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Avatar uploader */}
              <div className="flex items-center gap-6 p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                <div className="relative">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt="Profile avatar"
                      className="w-28 h-28 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                      {initials(profile.name)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      {uploadingImage ? 'Uploading...' : 'Update'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {t('bio')}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Education
                </button>
              </div>
              
              {profile.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Education #{index + 1}</h4>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        list={`rwanda-universities-${index}`}
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="Start typing to search or enter your institution"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      />
                      <datalist id={`rwanda-universities-${index}`}>
                        {RWANDA_UNIVERSITIES.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Degree
                      </label>
                      <select
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select degree</option>
                        {DEGREE_LEVELS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Field of Study
                      </label>
                      <select
                        value={FIELDS_OF_STUDY.includes(edu.field_of_study) ? edu.field_of_study : '__other'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__other') {
                            updateEducation(index, 'field_of_study', '');
                          } else {
                            updateEducation(index, 'field_of_study', val);
                          }
                        }}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      >
                        {FIELDS_OF_STUDY.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                        <option value="__other">Other</option>
                      </select>
                      {(!FIELDS_OF_STUDY.includes(edu.field_of_study)) && (
                        <input
                          type="text"
                          value={edu.field_of_study || edu.field_of_study_other || ''}
                          onChange={(e) => updateEducation(index, 'field_of_study_other', e.target.value)}
                          placeholder="Enter field of study"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Graduation Year
                      </label>
                      <select
                        value={edu.graduation_year}
                        onChange={(e) => updateEducation(index, 'graduation_year', parseInt(e.target.value))}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 3.5/4.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Experience</h3>
                <button
                  onClick={addWorkExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
              
              {profile.work_experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Experience #{index + 1}</h4>
                    <button
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exp.end_date}
                        onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                        disabled={exp.current}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateWorkExperience(index, 'current', e.target.checked)}
                          className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Currently working here</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Describe your role and responsibilities..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-accent-600 hover:text-accent-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                      if (input) {
                        addSkill(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages</h3>
                <div className="space-y-4">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                        placeholder="Language"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="native">Native</option>
                      </select>
                      <button
                        onClick={() => removeLanguage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Language
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Types
                  </label>
                  <div className="space-y-2">
                    {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.job_preferences.job_types.includes(type)}
                          onChange={(e) => {
                            const jobTypes = e.target.checked
                              ? [...profile.job_preferences.job_types, type]
                              : profile.job_preferences.job_types.filter(t => t !== type);
                            setProfile(prev => ({
                              ...prev,
                              job_preferences: { ...prev.job_preferences, job_types: jobTypes }
                            }));
                          }}
                          className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remote Preference
                  </label>
                  <select
                    value={profile.job_preferences.remote_preference}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      job_preferences: { ...prev.job_preferences, remote_preference: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={profile.job_preferences.availability}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      job_preferences: { ...prev.job_preferences, availability: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="2-months">2 months</option>
                    <option value="3-months">3 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Expectation (RWF)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={profile.job_preferences.salary_expectation.min}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        job_preferences: {
                          ...prev.job_preferences,
                          salary_expectation: { ...prev.job_preferences.salary_expectation, min: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      value={profile.job_preferences.salary_expectation.max}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        job_preferences: {
                          ...prev.job_preferences,
                          salary_expectation: { ...prev.job_preferences.salary_expectation, max: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
