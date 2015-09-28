if(true){
	module.exports = {
		host : 'mamigo.atlassian.net',
		proto : 'https',
		port : '443',
		strictSSL : true,
		user : 'akhil.kumar',
		password : '',
		isLocal : false
	};
}
else{
	module.exports = {
		host: 'akhil-office',
		proto : 'http',
		port: '2990',
		strictSSL : false,
		user: 'admin',
		password: 'admin',
		isLocal : true
	};	
}
