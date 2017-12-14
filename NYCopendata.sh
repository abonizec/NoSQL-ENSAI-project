#!/bin/bash

imp=false
req=false

#################################
# CONTROL OF THE FILE ARGUMENT  #
#################################

while getopts ":f:iq" flag; do
  case $flag in
    f)
      #Access to the dataset folder
      folder=$OPTARG
      #Error Handling
      if [ ! -d "$folder" ];then
         echo -e "\e[91mERROR: the folder $folder does not exist !"
         exit
      fi
      #Continue if no error
      echo ""
      echo "The path to the datasets file is $folder"
      echo ""
      ;;
    i)
      #Datasets importation
      imp=true
      ;;
    q)
      #Queries execution
      req=true
      ;;
    ?)
      #Missing argument for the folder
      echo -e "\e[91mERROR: Missing option argument for -$OPTARG"
      exit
      ;;      
  esac
done

if [ -z "$folder" ] && [ "$imp" = true ]; then
  echo -e "\e[91mERROR: The path to the datasets file (-f) must be defined before data importation !"
  exit
fi


#####################
# Data importation  #
#####################

if [ "$imp" = true ]; then

echo ""
echo "-----Datasets importation-----"
echo ""

#Crimes
echo ""
echo "-----Crimes-----"
mongoimport -d NYC -c crimes --type csv --file $folder/NYPD_Complaint_Data_Historic.csv --headerline --drop

#Tree data
echo ""
echo "-----Tree data-----"
mongoimport -d NYC -c tree --type csv --file $folder/2015_Street_Tree_Census_-_Tree_Data.csv --headerline --drop

#Legally operation businesses database
echo ""
echo "-----Legally operation businesses-----"
sed -i '1s/.*/LINB,LITYPE,LIEXP,LICAT,BNAME,BNAME2,BULD,STREET,STREET2,CITY,STATE,ZIP,PHONE,BORO,DETAIL,LONG,LAT/' $folder/Legally_Operating_Businesses.csv
mongoimport -d NYC -c business --type csv --file $folder/Legally_Operating_Businesses.csv --headerline --drop

#Farmers markets
echo "-----Farmers markets-----"
sed -i '1s/.*/BORO,MARKET,ADD,DAY,HOUR,DBUCK,ABUCK,EBT,STELLAR/' $folder/2012_NYC_Farmers_Market_List.csv
mongoimport -d NYC -c market --type csv --file $folder/2012_NYC_Farmers_Market_List.csv --headerline --drop


fi


#####################
# MongoDB queries   #
#####################

if [ "$req" = true ]; then

echo ""
echo "----- Connection to MongoDB -----"
echo ""

mongo < MongoDB_queries.js

fi

