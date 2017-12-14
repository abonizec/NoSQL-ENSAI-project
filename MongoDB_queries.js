Mongo 

print("")

// Check the database existance
var found=new Boolean(false);
var dbs = db.getMongo().getDBNames();
for(var i in dbs) {
  if (dbs[i].toString() == 'NYC') 
    found = 1;
}
if (found.valueOf()) {} else {print("ERROR: the database NYC doesn't exist. Import the data (-i) before running queries."); quit();} 


// Continue if NYC exist

use NYC

print("")
print("\n----- Queries execution -----")
print("")

// Number of crimes per borough
db.crimes.aggregate([
  {$match: 
     { $or: [{ BORO_NM: 'BRONX' },{ BORO_NM: 'BROOKLYN' },{ BORO_NM: 'MANHATTAN' },{ BORO_NM: 'QUEENS' },{ BORO_NM: 'STATEN ISLAND' }]}
  },
  {$group : {
      _id: "$BORO_NM" ,
      nb_crimes : {$sum : 1}
  }},
  { $out : "crimes_q" }
])
//Adding a column population
db.crimes_q.update({},{$set : {"pop":1}},false,true)
//Updating column population with the population size in 2010 per borough
db.crimes_q.update({ _id : "BRONX" }, { $set: { "pop": 1385108} })
db.crimes_q.update({ _id : "BROOKLYN" }, { $set: { "pop": 2504700} })
db.crimes_q.update({ _id : "MANHATTAN" }, { $set: { "pop": 1585873} })
db.crimes_q.update({ _id : "QUEENS" }, { $set: { "pop": 2230722} })
db.crimes_q.update({ _id : "STATEN ISLAND" }, { $set: { "pop": 468730} })
//Calculating the number of crimes per inhabitant
db.crimes_q.aggregate(
   [
     { $project: { nb_crimes: 1, pop: 1, crime_rate: { $divide: [ "$nb_crimes", "$pop" ] } } },
     {$sort: {crime_rate: 1}},     
     { $out : "crimes_q" }
   ]
)


//Number of trees recorded per borough
db.tree.aggregate([
  {$match: 
     { $or: [{ boroname: 'Bronx' },{ boroname: 'Brooklyn' },{ boroname: 'Manhattan' },{ boroname: 'Queens' },
     { boroname: 'Staten Island' }]}
  },  
  {$group : {
      _id: "$boroname" ,
      nb_tree : {$sum : 1}
  }},
  { $out : "tree_q" }  
])
//Adding a column population
db.tree_q.update({},{$set : {"pop":1}},false,true)
//Updating column population with the population size in 2010 per borough
db.tree_q.update({ _id : "Bronx" }, { $set: { "pop": 1385108} })
db.tree_q.update({ _id : "Brooklyn" }, { $set: { "pop": 2504700} })
db.tree_q.update({ _id : "Manhattan" }, { $set: { "pop": 1585873} })
db.tree_q.update({ _id : "Queens" }, { $set: { "pop": 2230722} })
db.tree_q.update({ _id : "Staten Island" }, { $set: { "pop": 468730} })
//Calculating the number of trees recorded per inhabitant
db.tree_q.aggregate(
   [
     { $project: { nb_tree: 1, pop: 1, tree_rate: { $divide: [ "$nb_tree", "$pop" ] } } },
     { $sort: {tree_rate: -1}},     
     { $out : "tree_q" }
   ]
)

//Number of farmer's markets open on Wednesday per borough
db.market.aggregate([
  { $match: {DAY:{$regex:"Wednesday"}}},
  { $group : {_id : "$BORO", nb_market : {$sum : 1}}},
  { $sort: {nb_market: -1}},     
  { $out : "market_d" }
])

//Number of sidewalk cafe per borough
db.business.aggregate([
  { $match: {LICAT:{$eq:"Sidewalk Cafe"}}},
  { $group : {_id : "$BORO", nb_cafe : {$sum : 1}}},
  { $sort: {nb_cafe: -1}},     
  { $out : "business_d" }
])

//Printing all the queries results

print("")
print("\n----- Printing queries results -----")

print("\n*** Number of crimes per borough ***")
print("")
db.getCollection('crimes_q').find()

print("\n*** Amount of trees per borough ***")
print("")
db.getCollection('tree_q').find()

print("\n*** Number of farmer's markets open on Wednesday per borough ***")
print("")
db.getCollection('market_d').find()

print("\n*** Number of sidewalk cafe per borough ***")
print("")
db.getCollection('business_d').find()

print("\n*** List of farmer's markets in the Queens open on Wednesday ***")
print("")
db.market.find( 
  { $and: [ { BORO: { $eq: "Queens" } }, { DAY: { $regex:"Wednesday" } } ] },
  { BORO: 1, MARKET:1, ADD: 1, DAY: 1, HOUR:1, _id:0 }
).pretty()

print("\n*** List of sidewalk cafe in the Queen, Astoria neighborhoods, 31st avenue ***")
print("")
db.business.find( 
  { $and: [ { BORO: { $eq: "Queens" } }, { LICAT: { $eq: "Sidewalk Cafe" } }, {CITY: {$eq: "ASTORIA"}}, {STREET: {$regex: "31"}} ] },
  { BORO: 1, LICAT:1, BNAME: 1, STREET:1, CITY:1, _id:0 }
)

print("")
