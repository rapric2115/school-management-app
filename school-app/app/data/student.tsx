export const students = {
    1: {
        name: 'John Doe',
        grade: '10th Grade',
        attendancePorcentage: '90%',
        nextPayment: 'March 15, 2025',
        amount: '$500',
        gpa: 3.56,
        term: 'Spring 2025',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        gradeData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{data: [65, 59, 80, 81, 56, 55]}],
        },
        subjects: [
            {name: 'Math', grade: 'A', percentage: 94},
            {name: 'English', grade: 'B', percentage: 85},
            {name: 'Science', grade: 'A', percentage: 92},
            {name: 'History', grade: 'B', percentage: 86},
            {name: 'Art', grade: 'A', percentage: 95},
            {name: 'Music', grade: 'A', percentage: 98},
            {name: 'Physical Education', grade: 'A', percentage: 100},
            {name: 'Bible', grade: 'A', percentage: 100},
            {name: 'Computer Science', grade: 'A', percentage: 100},
            {name: 'Health', grade: 'A', percentage: 100},
            {name: 'Spanish', grade: 'A', percentage: 100},
        ],
        homework: [
            {
                subject: 'Math',
                title: 'Algebra',
                dueDate: 'March 15, 2025',
                status: 'Not Started',
            },
            {
                subject: 'English',
                title: 'Essay',
                dueDate: 'March 15, 2025',
                status: 'completed',
            },
            {
                subject: 'Science',
                title: 'Physics',
                dueDate: 'March 15, 2025',
                status: 'pending',
            }
        ]
    },
    2: {
        name: 'Emma Doe',
        grade: '9th Grade',
        attendance: '95%',
        nextPayment: 'March 15, 2025',
        amount: '$450',
        gpa: 2.88,
        term: 'Spring 2025',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        gradeData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{data: [65, 59, 80, 81, 56, 55]}],
        },
        subjects: [
            {name: 'Math', grade: 'A', percentage: 94},
            {name: 'English', grade: 'B', percentage: 85},
            {name: 'Science', grade: 'A', percentage: 92},
            {name: 'History', grade: 'B', percentage: 86},
            {name: 'Art', grade: 'A', percentage: 95},
            {name: 'Music', grade: 'A', percentage: 98},
            {name: 'Physical Education', grade: 'A', percentage: 100},
        ],
        homework: [
            {
            subject: 'Math',
            title: 'Algebra',
            dueDate: 'March 15, 2025',
            status: 'Not Started',
            },
            {
            subject: 'English',
            title: 'Essay',
            dueDate: 'March 15, 2025',
            status: 'completed',
            }
        ]
    }
}

export type Student = typeof students[keyof typeof students];
