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
import BaseContainer from '../../core/container/base-container';

class PMProjectContainer extends BaseContainer {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init(this.props.history.location.state.parent);
		} else {
			this.props.actions.init();
		}
	}

	getState = () => {
		return this.props.pmproject;
	}
	
	getForm = () => {
		return "PM_PROJECT_FORM";
	}
	
	onOption = (code,item) => {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::onOption',msg:" code "+code});
		if (this.onOptionBase(code,item)) {
			return;
		}
		
		switch(code) {
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

	render() {
		fuLogger.log({level:'TRACE',loc:'ProjectContainer::render',msg:"Hi there"});
		if (this.props.pmproject.isModifyOpen) {
			return (
				<ProjectModifyView
				itemState={this.props.pmproject}
				appPrefs={this.props.appPrefs}
				onSave={this.onSave}
				onCancel={this.onCancel}
				inputChange={this.inputChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmproject.items != null) {
			return (
				<ProjectView
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
