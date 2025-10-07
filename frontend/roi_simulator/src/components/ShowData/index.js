import { Component } from "react";
import './index.css';

class ShowData extends Component {
    state = {
        completeData: [], 
        selectedScenario: null, 
        currentId: ''
    };

    componentDidMount() {
        this.fetchScenarios();
    }

    fetchScenarios = async () => {
        try {
            const response = await fetch('http://localhost:5000/scenarios');
            if (!response.ok) throw new Error('Failed to fetch scenarios');

            const data = await response.json();
            this.setState({ completeData: data });
        } catch (error) {
            console.error(error);
        }
    };

    fetchScenarioById = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/scenarios/${id}`);
            if (!response.ok) throw new Error('Failed to fetch scenario details');

            const data = await response.json();
            this.setState({ selectedScenario: data, currentId: id });
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        const { completeData, selectedScenario } = this.state;

        return (
            <div className="showdata-container">
                <h2>All Scenarios</h2>
                <ul className="scenario-list">
                    {completeData.map((scenario) => (
                        <li
                            key={scenario.id}
                            className="scenario-item"
                            onClick={() => this.fetchScenarioById(scenario.id)}
                        >
                            {scenario.scenario_name} (ID: {scenario.id})
                        </li>
                    ))}
                </ul>

                {selectedScenario && (
                    <div className="scenario-details">
                        <h3>Scenario Details: {selectedScenario.scenario_name}</h3>
                        <p>Monthly Invoice Volume: {selectedScenario.monthly_invoice_volume}</p>
                        <p>Number of AP Staff: {selectedScenario.num_ap_staff}</p>
                        <p>Average Hours per Invoice: {selectedScenario.avg_hours_per_invoice}</p>
                        <p>Hourly Wage: {selectedScenario.hourly_wage}</p>
                        <p>Error Rate Manual: {selectedScenario.error_rate_manual}</p>
                        <p>Error Rate Auto: {selectedScenario.error_rate_auto}</p>
                        <p>Error Cost: {selectedScenario.error_cost}</p>
                        <p>Time Horizon (Months): {selectedScenario.time_horizon_months}</p>
                        <p>One-Time Implementation Cost: {selectedScenario.one_time_implementation_cost}</p>
                        <p>Automated Cost per Invoice: {selectedScenario.automated_cost_per_invoice}</p>
                        <p>Min ROI Boost Factor: {selectedScenario.min_roi_boost_factor}</p>
                    </div>
                )}
            </div>
        );
    }
}

export default ShowData;
