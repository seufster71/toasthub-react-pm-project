/*
 * Copyright (C) 2020 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use-strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as projectActions from './project-actions';
import fuLogger from '../../core/common/fu-logger';
import ProjectView from '../../memberView/pm_project/project-view';
import ProjectModifyView from '../../memberView/pm_project/project-modify-view';
import utils from '../../core/common/utils';
import moment from 'moment';


class PMProjectContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {pageName:"PM_PROJECT",isDeleteModalOpen: false, errors:null, warns:null, successes:null};
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init(this.props.history.location.state.parent);
		} else {
			this.props.actions.init();
		}
	}

	onListLimitChange = (fieldName, event) => {
		let value = 20;
		if (this.props.codeType === 'NATIVE') {
			value = event.nativeEvent.text;
		} else {
			value = event.target.value;
		}

		let listLimit = parseInt(value);
		this.props.actions.listLimit({state:this.props.pmproject,listLimit});
	}

	onPaginationClick = (value) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onPaginationClick',msg:"fieldName "+ value});
		let listStart = this.props.pmproject.listStart;
		let segmentValue = 1;
		let oldValue = 1;
		if (this.state["PM_PROJECT_PAGINATION"] != null && this.state["PM_PROJECT_PAGINATION"] != ""){
			oldValue = this.state["PM_PROJECT_PAGINATION"];
		}
		if (value === "prev") {
			segmentValue = oldValue - 1;
		} else if (value === "next") {
			segmentValue = oldValue + 1;
		} else {
			segmentValue = value;
		}
		listStart = ((segmentValue - 1) * this.props.pmproject.listLimit);
		this.setState({"PM_PROJECT_PAGINATION":segmentValue});
		
		this.props.actions.list({state:this.props.pmproject,listStart});
	}

	onSearchChange = (fieldName, event) => {
		if (event.type === 'keypress') {
			if (event.key === 'Enter') {
				this.onSearchClick(fieldName,event);
			}
		} else {
			if (this.props.codeType === 'NATIVE') {
				this.setState({[fieldName]:event.nativeEvent.text});
			} else {
				this.setState({[fieldName]:event.target.value});
			}
		}
	}
	
	onSearchClick = (fieldName,event) => {
		let searchCriteria = [];
		if (fieldName === 'PM_PROJECT-SEARCHBY') {
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					option.searchValue = this.state['PM_PROJECT-SEARCH'];
					option.searchColumn = event[o].value;
					searchCriteria.push(option);
				}
			}
		} else {
			for (let i = 0; i < this.props.pmproject.searchCriteria.length; i++) {
				let option = {};
				option.searchValue = this.state['PM_PROJECT-SEARCH'];
				option.searchColumn = this.props.pmproject.searchCriteria[i].searchColumn;
				searchCriteria.push(option);
			}
		}

		this.props.actions.search({state:this.props.pmproject,searchCriteria});
	}

	onOrderBy = (selectedOption, event) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onOrderBy',msg:"id " + selectedOption});
		let orderCriteria = [];
		if (event != null) {
			for (let o = 0; o < event.length; o++) {
				let option = {};
				if (event[o].label.includes("ASC")) {
					option.orderColumn = event[o].value;
					option.orderDir = "ASC";
				} else if (event[o].label.includes("DESC")){
					option.orderColumn = event[o].value;
					option.orderDir = "DESC";
				} else {
					option.orderColumn = event[o].value;
				}
				orderCriteria.push(option);
			}
		} else {
			let option = {orderColumn:"PM_PROJECT_TABLE_NAME",orderDir:"ASC"};
			orderCriteria.push(option);
		}
		this.props.actions.orderBy({state:this.props.pmproject,orderCriteria});
	}
	
	onSave = () => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onSave',msg:"test"});
		let errors = utils.validateFormFields(this.props.pmproject.prefForms.PM_PROJECT_FORM,this.props.pmproject.inputFields);
		
		if (errors.isValid){
			this.props.actions.saveItem({state:this.props.pmproject});
		} else {
			this.setState({errors:errors.errorMap});
		}
	}
	
	onModify = (item) => {
		let id = null;
		if (item != null && item.id != null) {
			id = item.id;
		}
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onModify',msg:"test"+id});
		this.props.actions.modifyItem({id,appPrefs:this.props.appPrefs});
	}
	
	onDelete = (item) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onDelete',msg:"test"});
		this.setState({isDeleteModalOpen:false});
		if (item != null && item.id != "") {
			this.props.actions.deleteItem({state:this.props.pmproject,id:item.id});
		}
	}
	
	openDeleteModal = (item) => {
		this.setState({isDeleteModalOpen:true,selected:item});
	}
	
	onOption = (code,item) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onOption',msg:" code "+code});
		switch(code) {
			case 'MODIFY': {
				this.onModify(item);
				break;
			}
			case 'DELETE': {
				this.openDeleteModal(item);
				break;
			}
			case 'DELETEFINAL': {
				this.onDelete(item);
				break;
			}
			case 'RELEASE': {
				this.props.history.push({pathname:'/pm-release',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
			case 'BACKLOG': {
				this.props.history.push({pathname:'/pm-backlog',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
			case 'DEFECT': {
				this.props.history.push({pathname:'/pm-defect',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
			case 'ENHANCEMENT': {
				this.props.history.push({pathname:'/pm-enhancement',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
			case 'SHARE': {
				this.props.history.push({pathname:'/pm-team',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
			case 'SCRUM': {
				this.props.history.push({pathname:'/pm-scrum',state:{parent:item,parentType:"PROJECT"}});
				break;
			}
		}
	}
	
	closeModal = () => {
		this.setState({isDeleteModalOpen:false,errors:null,warns:null});
	}
	
	onCancel = () => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onCancel',msg:"test"});
		this.props.actions.list({state:this.props.pmproject});
	}
	
	inputChange = (type,field,value,event) => {
		utils.inputChange({type,props:this.props,field,value,event});
	}
	
	onBlur = (field) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onBlur',msg:field.name});
		let fieldName = field.name;
		// get field and check what to do
		if (field.optionalParams != ""){
			let optionalParams = JSON.parse(field.optionalParams);
			if (optionalParams.onBlur != null) {
				if (optionalParams.onBlur.validation != null && optionalParams.onBlur.validation == "matchField") {
					if (field.validation != "") {
						let validation = JSON.parse(field.validation);
						if (validation[optionalParams.onBlur.validation] != null && validation[optionalParams.onBlur.validation].id != null){
							if (this.props.pmproject.inputFields[validation[optionalParams.onBlur.validation].id] == this.props.pmproject.inputFields[fieldName]) {
								if (validation[optionalParams.onBlur.validation].successMsg != null) {
									let successMap = this.state.successes;
									if (successMap == null){
										successMap = {};
									}
									successMap[fieldName] = validation[optionalParams.onBlur.validation].successMsg;
									this.setState({successes:successMap, errors:null});
								}
							} else {
								if (validation[optionalParams.onBlur.validation].failMsg != null) {
									let errorMap = this.state.errors;
									if (errorMap == null){
										errorMap = {};
									}
									errorMap[fieldName] = validation[optionalParams.onBlur.validation].failMsg;
									this.setState({errors:errorMap, successes:null});
								}
							}
						}
					}
				} else if (optionalParams.onBlur.func != null) {
					
				}
			}
		}
			
	}
	
	goBack = () => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::goBack',msg:"test"});
		this.props.history.goBack();
	}

	render() {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::render',msg:"Hi there"});
		if (this.props.pmproject.isModifyOpen) {
			return (
				<ProjectModifyView
				containerState={this.state}
				item={this.props.pmproject.selected}
				inputFields={this.props.pmproject.inputFields}
				appPrefs={this.props.appPrefs}
				itemPrefForms={this.props.pmproject.prefForms}
				onSave={this.onSave}
				onCancel={this.onCancel}
				onReturn={this.onCancel}
				inputChange={this.inputChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmproject.items != null) {
			return (
				<ProjectView
				containerState={this.state}
				itemState={this.props.pmproject}
				appPrefs={this.props.appPrefs}
				onListLimitChange={this.onListLimitChange}
				onSearchChange={this.onSearchChange}
				onSearchClick={this.onSearchClick}
				onPaginationClick={this.onPaginationClick}
				onOrderBy={this.onOrderBy}
				closeModal={this.closeModal}
				onOption={this.onOption}
				inputChange={this.inputChange}
				goBack={this.goBack}
				session={this.props.session}
				/>
			);
		} else {
			return (<div> Loading... </div>);
		}
	}
}

PMProjectContainer.propTypes = {
	appPrefs: PropTypes.object,
	actions: PropTypes.object,
	pmproject: PropTypes.object,
	session: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {appPrefs:state.appPrefs, pmproject:state.pmproject, session:state.session};
}

function mapDispatchToProps(dispatch) {
  return { actions:bindActionCreators(projectActions,dispatch) };
}

export default connect(mapStateToProps,mapDispatchToProps)(PMProjectContainer);
