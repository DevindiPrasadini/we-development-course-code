import Student from "../models/student.js";

export function createStudent(req, res) {
	
    if(req.user==null){
		res.status(403).json({//token ekak ntuv avoth
			message :"unauthorized access you need to login before crating student"
		})
		return;
	}
	if(!req.user.isAdmin){//user admin knk neme nm student create krnn ba
		res.status(403).json({
			message : "only admin can create students"
		})
	}

	const newStudent = new Student({
		name: req.body.name,
		age: req.body.age,
		city: req.body.city,
	});

	newStudent.save().then(() => {
		res.json({
			message: "Student Created Successfully",
		});
	}).catch((error) => {
		console.error("Error creating student:", error);
	});
}

export async function createStudentAsync(req, res){
	try{

		const newStudent = new Student({
		name: req.body.name,
		age: req.body.age,
		city: req.body.city,
	});

	await newStudent.save()
	res.json({
		message: "Student Created Successfully",
	});

	}catch(error){
		console.error("Error creating student:", error);
		res.status(500).json({ error: "Failed to create student" });
};
	}	


export function getStudents(req,res){

    Student.find().then(

        (students)=>{

            res.json(students)

        }

    )
}