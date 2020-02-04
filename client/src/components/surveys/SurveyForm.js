// SurveyForm shows a form for a user to add input
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import SurveyField from './SurveyField';
import validateEmails from '../../utils/validateEmails';

// Fields in our survey form
const FIELDS = [
    { label: 'Survey Title', name: 'title' },
    { label: 'Subject Line', name: 'subject' },
    { label: 'Email', name: 'body' },
    { label: 'Recipients List', name: 'emails' }
];

class SurveyForm extends Component {
    renderFields() {
        return FIELDS.map(({ label, name }) => (
            <Field
                key={name}
                name={name}
                label={label}
                type="text"
                component={SurveyField}
            />
        ));
    }

    render() {
        return (
            <div>
                <form
                    onSubmit={this.props.handleSubmit(values =>
                        console.log(values)
                    )}
                >
                    {this.renderFields()}
                    <Link to="/surveys" className="red btn-flat white-text">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="teal btn-flat right white-text"
                    >
                        Next
                        <i className="material-icons right">done</i>
                    </button>
                </form>
            </div>
        );
    }
}

function validate(values) {
    let errors = {};

    errors.emails = validateEmails(values.emails || '');

    FIELDS.forEach(({ name, label }) => {
        if (!values[name]) {
            errors[name] = `You must provide a ${label}`;
        }
    });

    return errors;
}

export default reduxForm({
    validate,
    form: 'surveyForm'
})(SurveyForm);
