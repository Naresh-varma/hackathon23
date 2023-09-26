const { OpenAI } = require('openai');
const BluebirdPromise = require('bluebird');
const request = require('request');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
})
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_PAID
});

const persons = [
    {
        "collection": "person",
        "name": "Emma Brown",
        "email": "emma.brown@example.com",
        "location": "San Francisco",
        "education": "B.A. Communications",
        "workExperience": "4 years",
        "skills": ["Content Writing", "Editing", "Creativity"],
        "certifications": ["Certified Content Marketer"]
    },
    {
        "collection": "person",
        "name": "Michael Clark",
        "email": "michael.clark@example.com",
        "location": "London",
        "education": "MBA",
        "workExperience": "6 years",
        "skills": ["Financial Analysis", "Budgeting", "Leadership"],
        "certifications": ["CFA"]
    }
];

/*
[
    {
        "collection": "person",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "location": "New York",
        "education": "M.S. Computer Science",
        "workExperience": "6 years",
        "skills": ["Java", "Spring", "Hibernate", "SQL"],
        "certifications": ["Oracle Certified Professional"]
    },
    {
        "collection": "person",
        "name": "Alice Smith",
        "email": "alice.smith@example.com",
        "location": "San Francisco",
        "education": "B.S. Information Systems",
        "workExperience": "5 years",
        "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
        "certifications": ["AWS Certified Developer"]
    },
    {
        "collection": "person",
        "name": "Michael Johnson",
        "email": "michael.johnson@example.com",
        "location": "London",
        "education": "B.E. Computer Engineering",
        "workExperience": "7 years",
        "skills": ["Python", "Django", "SQL", "AWS"],
        "certifications": ["Certified Scrum Master"]
    },
    {
        "collection": "person",
        "name": "Sarah Lee",
        "email": "sarah.lee@example.com",
        "location": "Toronto",
        "education": "B.Sc. Computer Science",
        "workExperience": "3 years",
        "skills": ["C#", ".NET", "ASP.NET", "SQL Server"],
        "certifications": ["Microsoft Certified Professional"]
    },
    {
        "collection": "person",
        "name": "Amit Patel",
        "email": "amit.patel@example.com",
        "location": "Mumbai",
        "education": "B.E. Information Technology",
        "workExperience": "6 years",
        "skills": ["Angular", "JavaScript", "Node.js", "MongoDB"],
        "certifications": ["Google Cloud Associate"]
    },
    {
        "collection": "person",
        "name": "Laura Davis",
        "email": "laura.davis@example.com",
        "location": "Los Angeles",
        "education": "M.S. Software Engineering",
        "workExperience": "8 years",
        "skills": ["Java", "Spring Boot", "MySQL", "React"],
        "certifications": ["ISTQB Certified Tester"]
    },
    {
        "collection": "person",
        "name": "Raj Sharma",
        "email": "raj.sharma@example.com",
        "location": "Delhi",
        "education": "B.Tech Computer Science",
        "workExperience": "5 years",
        "skills": ["PHP", "Laravel", "MySQL", "JavaScript"],
        "certifications": ["AWS Certified Solutions Architect"]
    },
    {
        "collection": "person",
        "name": "Sophia Anderson",
        "email": "sophia.anderson@example.com",
        "location": "Sydney",
        "education": "B.E. Computer Engineering",
        "workExperience": "4 years",
        "skills": ["Python", "Flask", "SQLAlchemy", "React"],
        "certifications": ["Certified Ethical Hacker"]
    },
    {
        "collection": "person",
        "name": "Alex Wang",
        "email": "alex.wang@example.com",
        "location": "Beijing",
        "education": "M.S. Computer Science",
        "workExperience": "6 years",
        "skills": ["C++", "Qt", "OpenGL", "CUDA"],
        "certifications": ["Microsoft Certified Azure Developer"]
    }
]
*/


const persons1 = [
    {
        collection: 'person',
        name: 'Naresh',
        email: 'naresh@gmail.com',
        location: 'Hyderabad',
        education: 'B-tech',
        workExperience: '2 years',
        skillsinternal: ['NodeJs', 'express','elastic', 'mongo'],
        skills: [73,3,3],
        certifications: ['aws certified architect']
    },
    {
        collection: 'person',
        name: 'Nivya',
        email: 'nivya@gmail.com',
        location: 'Bangalore',
        education: 'B-tech',
        workExperience: '4 years',
        skills: ['VueJs', 'meterialUI', 'redux', 'mongo'],
        certifications: ['product engineer']
    }
]

const jobVacancies = [
    {
        "collection": "vacancy",
        "title": "Content Writer",
        "location": "San Francisco",
        "employmentType": "full-time",
        "jobDescription": "We're seeking a talented Content Writer to join our team. You'll be responsible for creating engaging and relevant content across various platforms. Strong writing and editing skills, creativity, and ability to adapt to different tones and styles are essential. [San Francisco, Full-time]",
        "requiredSkills": ["Content Writing", "Editing", "Creativity"]
    },
    {
        "collection": "vacancy",
        "title": "Finance Manager",
        "location": "London",
        "employmentType": "full-time",
        "jobDescription": "We're looking for an experienced Finance Manager to lead our financial operations. You will be responsible for budgeting, financial analysis, and ensuring compliance with financial regulations. Strong financial acumen and leadership skills are essential. [London, Full-time]",
        "requiredSkills": ["Financial Analysis", "Budgeting", "Financial Regulations", "Leadership"]
    },
    {
        "collection": "vacancy",
        "title": "Environmental Scientist",
        "location": "Washington D.C.",
        "employmentType": "full-time",
        "jobDescription": "Join our team as an Environmental Scientist and contribute to projects related to environmental impact assessments and sustainability initiatives. Strong analytical skills and knowledge of environmental regulations are crucial. [Washington D.C., Full-time]",
        "requiredSkills": ["Environmental Impact Assessment", "Sustainability", "Analytical Skills", "Environmental Regulations"]
    },
    {
        "collection": "vacancy",
        "title": "Music Producer",
        "location": "Los Angeles",
        "employmentType": "full-time",
        "jobDescription": "We're hiring a Music Producer to oversee the production and recording process. Experience with music composition, audio engineering, and sound design is necessary. [Los Angeles, Full-time]",
        "requiredSkills": ["Music Composition", "Audio Engineering", "Sound Design"]
    }
];
/*
[
    {
        "collection": "vacancy",
        "title": "Full Stack Developer",
        "location": "New York",
        "employmentType": "full-time",
        "jobDescription": "We are seeking a highly skilled Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications, from the frontend to the backend. Experience with React, Node.js, and MongoDB is essential. [New York, Full-time]",
        "requiredSkills": ["React", "Node.js", "MongoDB"]
    },
    {
        "collection": "vacancy",
        "title": "Machine Learning Engineer",
        "location": "San Francisco",
        "employmentType": "full-time",
        "jobDescription": "We are looking for a Machine Learning Engineer to work on cutting-edge AI projects. You will design, implement, and deploy machine learning models. Strong proficiency in Python and experience with TensorFlow or PyTorch is required. [San Francisco, Full-time]",
        "requiredSkills": ["Python", "TensorFlow", "Machine Learning"]
    },
    {
        "collection": "vacancy",
        "title": "Frontend Developer",
        "location": "London",
        "employmentType": "full-time",
        "jobDescription": "Join our team as a Frontend Developer and help create engaging user experiences. Proficiency in HTML5, CSS3, and JavaScript frameworks such as React or Angular is necessary. Experience in responsive design and cross-browser compatibility is a plus. [London, Full-time]",
        "requiredSkills": ["HTML5", "CSS3", "React", "Angular"]
    },
    {
        "collection": "vacancy",
        "title": "Data Analyst",
        "location": "Bangalore",
        "employmentType": "full-time",
        "jobDescription": "We are seeking a Data Analyst to interpret data and turn it into actionable insights. Proficiency in SQL, data visualization tools, and experience in data analysis are essential. [Bangalore, Full-time]",
        "requiredSkills": ["SQL", "Data Analysis", "Data Visualization"]
    },
    {
        "collection": "vacancy",
        "title": "DevOps Engineer",
        "location": "Berlin",
        "employmentType": "full-time",
        "jobDescription": "Join us as a DevOps Engineer and help optimize our development and deployment processes. Experience with cloud platforms (e.g., AWS, Azure), CI/CD, and automation tools is required. [Berlin, Full-time]",
        "requiredSkills": ["DevOps", "AWS", "Azure", "CI/CD"]
    },
    {
        "collection": "vacancy",
        "title": "UI/UX Designer",
        "location": "Los Angeles",
        "employmentType": "full-time",
        "jobDescription": "We are looking for a creative UI/UX Designer to enhance user satisfaction by improving the usability and accessibility of our web and mobile applications. Proficiency in design tools and experience in creating wireframes and prototypes is necessary. [Los Angeles, Full-time]",
        "requiredSkills": ["UI/UX Design", "Wireframing", "Prototyping"]
    },
    {
        "collection": "vacancy",
        "title": "Cybersecurity Analyst",
        "location": "Singapore",
        "employmentType": "full-time",
        "jobDescription": "We are hiring a Cybersecurity Analyst to protect our systems and networks from cyber threats. Knowledge of network security, encryption, and incident response is crucial. Relevant certifications such as CISSP or CISM are a plus. [Singapore, Full-time]",
        "requiredSkills": ["Cybersecurity", "Network Security", "Incident Response", "CISSP"]
    },
    {
        "collection": "vacancy",
        "title": "Product Manager",
        "location": "Seattle",
        "employmentType": "full-time",
        "jobDescription": "We are seeking a skilled Product Manager to guide the development and success of our products. Strong communication skills, market research abilities, and experience in product lifecycle management are important. [Seattle, Full-time]",
        "requiredSkills": ["Product Management", "Market Research", "Product Lifecycle"]
    },
    {
        "collection": "vacancy",
        "title": "AI Research Scientist",
        "location": "Tokyo",
        "employmentType": "full-time",
        "jobDescription": "Join our team as an AI Research Scientist and work on cutting-edge research projects. Strong background in machine learning, deep learning, and programming skills in Python is required. [Tokyo, Full-time]",
        "requiredSkills": ["Machine Learning", "Deep Learning", "Python"]
    },
    {
        "collection": "vacancy",
        "title": "Database Administrator",
        "location": "Toronto",
        "employmentType": "full-time",
        "jobDescription": "We are looking for a skilled Database Administrator to design, implement, and maintain our databases. Proficiency in SQL, database tuning, and experience with databases like PostgreSQL or MySQL is essential. [Toronto, Full-time]",
        "requiredSkills": ["Database Administration", "SQL", "PostgreSQL", "MySQL"]
    }
]
*/
const jobVacancies1 = [
    {   
        collection: 'vacancy',
        title: 'Backend Engineer',
        location: 'Hyderabad',
        employementType: 'full-time',
        jobDescription: 'We are looking for a talented and experienced Backend Engineer to join our team and help us build and maintain our scalable and reliable backend systems. You will be using ExpressJS and Elasticsearch to develop and maintain RESTful APIs that power our web and mobile applications. Experience with Node.js, RESTful APIs, and cloud computing is a plus. [Hyderabad, Full-time]',
        requiredSkills: ['expressJs', 'elastic'],
    },
    {
        collection: 'vacancy',
        title: 'Frontend Engineer',
        location: 'Hyderabad',
        employementType: 'full-time',
        jobDescription: 'We are looking for a talented and experienced Front-End Engineer to join our team and help us build and maintain our user-facing web and mobile applications. You will be responsible for developing and maintaining the user interface (UI) and user experience (UX) of our applications using HTML, CSS, and JavaScript. You will also work closely with our back-end engineers to integrate the UI and UX with the back-end systems.',
        requiredSkills: ['VueJs', 'meterialUI'],
    }
];

const arr = [
    {
        "title": "The Basics of Computer Programming",
        "content": "We are having an opening to fill for a Senoir designer with proficient knowledge in user research and user experience designing. Should be comfortable to use tools like Figma, Adobe and Balsamiq to prototype and design wireframes. should be comfortable to work anywhere in UK."
    },
]
const arr1 = [
    {
    "title": "The Basics of Computer Programming",
    "content": "Computer programming involves writing instructions (code) that a computer can interpret and execute. It requires knowledge of programming languages like Python, Java, C++, and more. Programmers use logic, algorithms, and data structures to solve problems and create software applications, games, and websites that power our digital world."
    },
    {
    "title": "The Human Digestive System",
    "content": "The human digestive system is a complex series of organs responsible for breaking down food and absorbing nutrients. It includes the mouth, esophagus, stomach, small intestine, large intestine, and various associated glands. Digestion begins in the mouth with the action of enzymes and continues through a carefully orchestrated process that ensures essential nutrients reach the body's cells."
    },
    {
    "title": "Renewable Energy Sources",
    "content": "Renewable energy sources are natural resources that can be replenished over time. They include solar energy, wind power, hydropower, geothermal energy, and biomass. Unlike fossil fuels, which are finite, renewable energy sources offer sustainable and environmentally friendly alternatives for meeting our energy needs."
    },
    {
    "title": "The Water Cycle",
    "content": "The water cycle, also known as the hydrologic cycle, is the continuous movement of water on, above, and below the surface of the Earth. It involves processes such as evaporation, condensation, precipitation, and runoff. This cycle regulates the distribution of water across the planet, sustaining life and maintaining ecological balance."
    },
    {
    "title": "Photosynthesis in Plants",
    "content": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy in the form of glucose. This vital process occurs in chloroplasts, specialized organelles containing the pigment chlorophyll. Through photosynthesis, plants play a crucial role in the Earth's ecosystem by producing oxygen and providing a source of food for various organisms."
    }
    ]

async function getEmbeddings(text) {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
    });
    return embedding;
}

const makeBulkRequestToEls = (data) => new Promise((resolve, reject) => {
    const indexName = data[0].collection ? data[0].collection : 'test_embeedings';
    client.bulk({
        body: data.flatMap(doc => [{ index: { _index: indexName } }, doc])
    }).then((body) => {
        console.log('Response :', body.items[0].index);
        return resolve();
    }).catch((err) => {
        console.error('getting error while posting data to elastic search :', err);
        return reject(err);   
    });

    // request.post({
    //     url: `http://localhost:9200/${indexName}/_bulk`,
    //     json: true,
    //     body: JSON.stringify().join(),
    // }, (err, res, body) => {
        
    // });
});

const main = () => new Promise((resolve, reject) => {
    BluebirdPromise.mapSeries(persons, (data) => new Promise((resolve, reject) => {
        let vectorText = data.content;
        if (data.collection === 'vacancy') {
            vectorText = data.title + data.location + data.requiredSkills;
        }
        if (data.collection === 'person') {
            vectorText = data.name + data.certifications.join(', ') + data.location + data.education + data.workExperience + data.skills.join(', ');
        }
        getEmbeddings(vectorText)
            .then((embedRes) => {
                console.log(`Recevied embeedings for ${data.title}`);
                console.log(`embeedings length ${embedRes?.data[0]?.embedding.length}`);
                if (embedRes) {
                    if (data.collection) {
                        data[`${data.collection}-vector`] = embedRes?.data[0]?.embedding;
                    } else data['title-vector'] = embedRes?.data[0]?.embedding;
                }
                return resolve();
            });
    }))
      .then(() => {
        console.log('completed');
          return resolve(makeBulkRequestToEls(persons));
      })
      .catch(err => console.error(err));
})

main();

// console.log(client.bulk);