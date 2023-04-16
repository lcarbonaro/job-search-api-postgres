const express = require('express');
const cors = require('cors');

// postgres connection set-up
const postgres = require('postgres');
require('dotenv').config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;
const sql = postgres(URL, { ssl: 'require' });
/**/


const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()) // for parsing application/json


app.get('/test', async (req,res) => {
	const result = await sql`select version()`;
	console.log(result);
	let data = {result};
	res.json(data);
});

// get all records READ in CRUD
app.get('/jobs', async (req,res) => {
	const result = await sql`select * from jobs`;
	console.log(result);
	let data = {result};
	res.json(data);
});

// get a specific record by id  READ in CRUD
app.get('/jobs/:id', async (req,res) => {
	const result = await sql`select * from jobs where id = ${req.params.id}`;
	console.log(result);
	let data = {result};
	res.json(data);
});

// get specific record(s) by search criteria  (READ in CRUD)
app.get('/jobSearch/:searchCriteria', async (req,res) => {	
	let sc = `%${ req.params.searchCriteria.toLowerCase() }%`;		
	const result = await sql`
	  select * from jobs 
	  where (
		lower(jobtitle) like ${sc} or
		lower(jobcategory) like ${sc} or
		lower(region) like ${sc} or
		lower(company) like ${sc} )`;
	console.log(result);
	let data = {result};
	res.json(data);
});

//example.com/books/123  req.params.id  // url parms
//example.com/books/:id  req.params
//example.com/books?criteria=123&field=id  req.query.criteria,req.query.field  // query string 

// get specific record(s) by search criteria  (READ in CRUD)
app.get('/jobSearchByField', async (req,res) => {	  
	let sc = `%${ req.query.criteria.toLowerCase() }%`;		
	let sf = `${ req.query.field }`;	
	
	console.log(`searching for string:${sc} in field:${sf}`);	

	const result = await sql`
	  select * from jobs 
	  where lower(${sql(sf)}) like ${sc} `;  // added sql(); see docs https://www.npmjs.com/package/postgres#building-queries

	console.log(result);
	let data = {result};
	res.json(data);
});



// insert a new record CREATE in CRUD
app.post('/jobs', async (req,res) => {
	const result = await sql`
		insert into jobs (jobtitle,company,region,jobcategory)
		values(
			${req.body.jobTitle},
			${req.body.company},
			${req.body.region},
			${req.body.jobCategory} )`;

	console.log(result);
	let data = {result};
	res.json(data);
});


// update a specific record UPDATE in CRUD
app.put('/jobs/:id', async (req,res)=>{
	const result = await sql`
		update jobs 
		set jobTitle = ${req.body.jobTitle},
			company = ${req.body.company},
			region = ${req.body.region},
			jobCategory = ${req.body.jobCategory} 
		where id = ${req.params.id}	`;
	console.log(result);
	let data = {result};
	res.json(data);
});


// delete a specific record DELETE in CRUD
app.delete('/jobs/:id', async (req,res) => {
	const result = await sql`delete from jobs where id = ${req.params.id}`;
	console.log(result);
	let data = {result};
	res.json(data);
});









app.listen(PORT,()=>{
    console.log(`Server is up and listening on port ${PORT}`);
});


