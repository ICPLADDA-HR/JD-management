-- Insert sample job descriptions for testing

DO $
DECLARE
    eng_dept_id UUID;
    frontend_team_id UUID;
    backend_team_id UUID;
    location_id UUID;
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    jd_id UUID;
BEGIN
    -- Get department and team IDs
    SELECT id INTO eng_dept_id FROM departments WHERE name = 'Engineering';
    SELECT id INTO frontend_team_id FROM teams WHERE name = 'Frontend Development';
    SELECT id INTO backend_team_id FROM teams WHERE name = 'Backend Development';
    SELECT id INTO location_id FROM locations LIMIT 1;

    -- Insert sample job description 1
    INSERT INTO job_descriptions (
        position,
        job_band,
        job_grade,
        location_id,
        department_id,
        team_id,
        direct_supervisor,
        job_purpose,
        status,
        created_by,
        updated_by
    ) VALUES (
        'Senior Frontend Developer',
        'JB 3',
        'JG 3.2',
        location_id,
        eng_dept_id,
        frontend_team_id,
        'Engineering Manager',
        'Lead the development of user-facing web applications using modern frontend technologies. Collaborate with design and backend teams to deliver high-quality, responsive, and accessible web experiences.',
        'published',
        test_user_id,
        test_user_id
    ) RETURNING id INTO jd_id;

    -- Insert responsibilities for the job description
    INSERT INTO jd_responsibilities (jd_id, category, description, order_index) VALUES
        (jd_id, 'strategic', 'Define frontend architecture and technology stack decisions', 1),
        (jd_id, 'strategic', 'Research and evaluate new frontend technologies and frameworks', 2),
        (jd_id, 'team_management', 'Mentor junior developers and conduct code reviews', 1),
        (jd_id, 'team_management', 'Lead technical discussions and knowledge sharing sessions', 2),
        (jd_id, 'general', 'Develop and maintain responsive web applications', 1),
        (jd_id, 'general', 'Implement user interfaces based on design specifications', 2),
        (jd_id, 'general', 'Optimize application performance and user experience', 3),
        (jd_id, 'culture', 'Promote best practices in frontend development', 1),
        (jd_id, 'efficiency', 'Implement automated testing and CI/CD processes', 1),
        (jd_id, 'other', 'Participate in cross-functional project teams', 1);

    -- Insert risks for the job description
    INSERT INTO jd_risks (jd_id, type, description, risk_level, order_index) VALUES
        (jd_id, 'external', 'Rapid changes in frontend technology landscape', 'medium', 1),
        (jd_id, 'external', 'Browser compatibility issues with new features', 'low', 2),
        (jd_id, 'internal', 'Knowledge gaps in team for new technologies', 'medium', 1),
        (jd_id, 'internal', 'Technical debt in legacy frontend code', 'high', 2);

    -- Insert sample job description 2
    INSERT INTO job_descriptions (
        position,
        job_band,
        job_grade,
        location_id,
        department_id,
        team_id,
        direct_supervisor,
        job_purpose,
        status,
        created_by,
        updated_by
    ) VALUES (
        'Backend Developer',
        'JB 2',
        'JG 2.3',
        location_id,
        eng_dept_id,
        backend_team_id,
        'Senior Backend Developer',
        'Develop and maintain server-side applications and APIs. Ensure system reliability, performance, and security while collaborating with frontend and DevOps teams.',
        'draft',
        test_user_id,
        test_user_id
    ) RETURNING id INTO jd_id;

    -- Insert responsibilities for the second job description
    INSERT INTO jd_responsibilities (jd_id, category, description, order_index) VALUES
        (jd_id, 'strategic', 'Contribute to API design and database architecture decisions', 1),
        (jd_id, 'general', 'Develop RESTful APIs and microservices', 1),
        (jd_id, 'general', 'Implement database queries and data models', 2),
        (jd_id, 'general', 'Write unit and integration tests', 3),
        (jd_id, 'efficiency', 'Optimize database performance and query efficiency', 1),
        (jd_id, 'other', 'Support production deployments and troubleshooting', 1);

    -- Insert risks for the second job description
    INSERT INTO jd_risks (jd_id, type, description, risk_level, order_index) VALUES
        (jd_id, 'external', 'Third-party service dependencies and outages', 'medium', 1),
        (jd_id, 'internal', 'Database performance bottlenecks', 'medium', 1),
        (jd_id, 'internal', 'Security vulnerabilities in API endpoints', 'high', 2);

END $;