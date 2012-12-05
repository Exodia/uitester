                                                                wwsafe  8  
��ե&��ͥ_�4��w���$}�|��~Lr�CV��*"㙾���m�$���n�=�P���zf��\2%2���3�&C���xxH�[����yR(	�V���t�Ƃ����9�m�g[ڟ����6�vG����*fQ0OR���rx��S'�p�.^�w��kE��ֱ�� �]UN��8�	X��F�I�p%��|�٥R�
���䳺��y0�B#��P���y@׸	d|5����_�[���ƶdd�����U�釣/s��nG��\
6Y�an��FB�0{�o����zjN�('CREATE DATABASE '+TEST_DATABASE, function(err) {
			if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
				 throw err;
			}
			console.log("create database success!"+err);
	});

	client.query('USE uitest');

	client.query('CREATE TABLE '+TEST_TABLE+'(id int(6) not null primary key auto_increment,task_name char(40) not null,task_target_uri char(100) not null,task_inject_uri char(100) not null,username char(20) not null,password char(20),task_result text(400),failed_specs int(4) default "0",total_specs int(4) default "0")',function(err){
		if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw err;
		}
		console.log("create table success!"+err);
	});
}

function addOne(){
	client.query(addOneNote(TEST_TABLE,'test task','http://item.taobao.com/item.htm?id=10361183984','http://uitest.taobao.net/case/42.js','qiyou','123456','this is a test',0,10),function(err){
		if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw err;
		}
		console.log("add one note success!"+err);
	});
}

function findAll(){
	client.query(findAll(TEST_TABLE),function(err,result){
		if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw err;
		}
		console.log("find one note success!"+err);
		console.log(result);
		return result;
	});
}

function updateOne(){
	client.query(updateOneNote(TEST_TABLE,'the latest result',2,16,2),function(err){
		if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw err;
		}
		console.log("update one note success!"+err);
	});
}


function addOneNote(table,task_name, task_target_uri, task_inject_uri, username, password,task_result , failed_specs, total_specs){
	return 'insert into '+ table +' (task_name, task_target_uri, task_inject_uri, username, password,task_result , failed_specs, total_specs) values ("' + task_name + '", "' + task_target_uri + '", "' + task_inject_uri + '", "' + username + '", "' + password + '", "' + task_result + '", ' + failed_specs + ', '+ total_specs +');';
}

function findOne(table,id){
	return 'select * from ' + table + ' where id = '+id;
}

function findAll(table){
	return 'select * from ' + table;
}

function updateOneNote(table,result,failed_specs,total_specs,id){
	return 'update '+table+' set task_result = "'+result+'", failed_specs = '+failed_specs+', total_specs = '+total_specs+' where id = '+id;
}

function closeCon(){
	client.end();
}

exports.init = init();
exports.closeCon = closeCon();
exports.findAll = findAll();
���N9�n�����2}�4�[7��!X��ß�b��fԿLg�*w=�S��J��XOn8='m:��7|� �z�'L��@�+��T�Og�A�1��j�Ű���l��Mf���F���������l��.��ǼoΫ��w�zpD�2N�C;G�%Hj�*V���`�\��9�O��S��%cT�ϡ1l�RS�Ά%���mzbX�����jA~�������x������>�$���(�ܑ��&�OM��>Z\�e���UT��P���56�g������'8�^�\��7d��dEj����w��|^7R��c������Ant ]���V�2��ڧ�b�t��#�(n�JX+WO��F�z8�p��� P�<^�&�+�5��p�'��
�6�a���;���K��\�7�Ϸ?)W&CJ7�|p���+�#�x�����9�EF�O��x#Fc~Q^|ы�*D����W��Zz[Du���2�<��ِ���[��d۫�60��h�B�Fݸ5�7��ц�s����m�S۹�u�`sfIA&����Xi*(������.�a;x�8�i�MM��@6g@��o�'>ӑ��՚�hF�id`�B����7�xl����3�]Y�dr���](�_sH0�}��Ij�w�
�r��o�"��ZLC��|K�o|O~��],�z+�P`�o!,�R���ep��-A��|O�%?d��\�f]�V�]����]
M���+b: ���Ys��h�)�I�;8��x4��&x��i�ЋB�&��I��
���m��xj}/��_Z
�;���i�\��ay=� f��^�c��XO�ڱ
�r]�;��
��GغhZ�#fj�c\�zmN9��h�?��uF�9eqjR��5�`��Y��{�0/���3�M����F|�#W~�ne=�F����O�ڎ�� j'T�6���L+���U��Lt�s��I�D.>MT�g�4ÛJ-57#���+c��[1��Da���g����):���$�ltx�k���J�s��]��Ft[����Z���d�