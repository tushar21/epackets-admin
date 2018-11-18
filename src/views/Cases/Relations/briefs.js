import React, { Component } from 'react';
import { Col, Form, Input, Row, Button, FormGroup, Label } from 'reactstrap';
import HTTP from '../../../services/http'

export default class CaseBriefs extends Component{

    constructor(props){
        
        super(props);

        this.state = {
            cases : [],
            briefs: [],
            statutes: [],
            selectedCaseId : '',
            selectedBriefIds : [],
            selectedStatuteIds: []
        }

        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        this.selectCase = this.selectCase.bind(this);        
    }

    componentDidMount(){

        let data = {
            cases : [],
            briefs: [],
            statutes: [],
            selectedStatuteIds: [],
            selectedBriefIds : []
        }

        HTTP.get('cases/_search?pretty=true&q=*:*', {elastic: true})
        .then(cases=>{
            data['cases'] = cases.data.hits.hits
            data['selectedCaseId'] = data['cases'][0]['_id'];            
            return HTTP.get('statute/_search?pretty=true&q=*:*', {elastic: true});            
        })
        .then((statutes)=>{

            data['statutes'] = statutes.data.hits.hits;
            
            const payload ={
                "query": {
                  "term": {
                    "case_id": data.cases[0]._id
                  }
                } 
            }
            return HTTP.post('casestatuterelations/_search', payload, {elastic: true});

        })
        .then((caseStatuteRelations)=>{
            if(caseStatuteRelations.data && caseStatuteRelations.data.hits && caseStatuteRelations.data.hits.total){
                let selectedStatuteIds = [];
                caseStatuteRelations.data.hits.hits.forEach(function(ele){
                    selectedStatuteIds.push(ele._source.statute_id);
                })
                data['selectedStatuteIds'] = selectedStatuteIds;
            }
            return HTTP.get('briefs/_search?pretty=true&q=*:*', {elastic: true});
        })
        .then((briefs)=>{

            data['briefs'] = briefs.data.hits.hits;
            
            const payload ={
                "query": {
                  "term": {
                    "case_id": data.cases[0]._id
                  }
                } 
            }
            return HTTP.post('casebriefsrelations/_search', payload, {elastic: true});

        })
        .then((caseBriefsRelations)=>{

            if(caseBriefsRelations.data && caseBriefsRelations.data.hits && caseBriefsRelations.data.hits.total){
                let selectedBriefIds = [];
                caseBriefsRelations.data.hits.hits.forEach(function(ele){
                    selectedBriefIds.push(ele._source.brief_id);
                })
                data['selectedBriefIds'] = selectedBriefIds;
            }

            console.log(data, "data for setting state");
            this.setState(data);
        })
        .catch(function(err){
            console.log(err, "err in fetching cases");
        })
    }

    selectCase(event){
        const caseId = event.target.value;
        
        const payload ={
            "query": {
              "term": {
                "case_id": caseId
              }
            } 
        }
        
        HTTP.post('casebriefsrelations/_search', payload, {elastic: true})
        .then(caseRelations=>{
            let selectedBriefIds = caseRelations.data.hits.hits.map(ele=>{
                return ele._source.brief_id;
            })
            this.setState({
                'selectedBriefIds' : selectedBriefIds,
                'selectedCaseId': caseId
            })
        })
    }    


    save(event){

        const payload ={
            "query": {
              "term": {
                "case_id": this.state.selectedCaseId
              }
            } 
        }

        HTTP.post('casebriefsrelations/_delete_by_query', payload, {elastic: true})
        .then(data=>{
            console.log(data);
            var caseId = this.state.selectedCaseId;
            var promises = [];
            this.state.selectedBriefIds.forEach(brief=>{
                console.log(brief, "brief");
                let payload = {
                    case_id : caseId,
                    brief_id:  brief
                }
                promises.push(HTTP.post('casebriefsrelations/_doc', payload, {elastic: true}));
            })

            Promise.all(promises)
            .then(data=>{
                console.log(data, "all data inserted"); 
            })
        })

        HTTP.post('casestatuterelations/_delete_by_query', payload, {elastic: true})
        .then(data=>{
            console.log(data);
            var caseId = this.state.selectedCaseId;
            var promises = [];
            this.state.selectedStatuteIds.forEach(statuteId=>{
                let payload = {
                    case_id : caseId,
                    statute_id:  statuteId
                }
                promises.push(HTTP.post('casestatuterelations/_doc', payload, {elastic: true}));
            })

            Promise.all(promises)
            .then(data=>{
                console.log(data, "all data inserted"); 
            })
        })


        
        event.preventDefault();
    }

    handleChange(event, key, multiple= false){
        if(multiple){
            var updatedValue = this.state[key];
            var idx = updatedValue.indexOf(event.target.value);
            if(idx > -1){
                updatedValue.splice(idx, 1)
            } 
            else{
                updatedValue.push(event.target.value)
            }
            this.setState(
                {
                    ...this.state,
                    [key]: updatedValue
                }
            )
        }
        else{
            this.setState(
                {
                    ...this.state,
                    [key]: event.target.value
                }
            )
        }        
    }

    render(){
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Form onSubmit={this.save}>
                            <FormGroup>
                            <Label for="exampleSelect">Select Case</Label>
                                {(this.state && this.state.cases.length) ?
                                    <Input type="select" onChange={this.selectCase}>
                                    {this.state.cases.map(function(ele) {
                                        return (<option key={ele._id} value={ele._id}> {(ele && ele._source) ? ele._source.title : ''} </option>)
                                    }) }
                                    </Input> : ''
                                }
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleSelect">Select Briefs</Label>
                                {(this.state && this.state.briefs.length) ?
                                    <Input type="select" multiple value={this.state.selectedBriefIds} onChange={event=>this.handleChange(event, "selectedBriefIds", true)}>
                                    {this.state.briefs.map(ele=> {
                                        return (<option key={ele._id} value={ele._id} > {(ele && ele._source) ? ele._source.title : ''} </option>)
                                    }) }
                                    </Input> : ''
                                }
                            </FormGroup>

                            <FormGroup>
                                <Label for="exampleSelect">Select Statutes</Label>
                                {(this.state && this.state.statutes.length) ?
                                    <Input type="select" multiple value={this.state.selectedStatuteIds} onChange={event=>this.handleChange(event, "selectedStatuteIds", true)}>
                                    {this.state.statutes.map(ele=> {
                                        return (<option key={ele._id} value={ele._id} > {(ele && ele._source) ? ele._source.title : ''} </option>)
                                    }) }
                                    </Input> : ''
                                }
                            </FormGroup>

                            <FormGroup><Button>Submit</Button></FormGroup>
                        </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}