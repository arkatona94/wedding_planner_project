import { Link } from 'react-router-dom'
import { useState } from 'react'

const marriageLaws = [
    { state: 'Alabama', wait: 'None', validity: '30 Days', notes: 'No ceremony required; you simply submit a notarized affidavit to the probate court.' },
    { state: 'Alaska', wait: '3 Days', validity: '90 Days', notes: 'Requires 2 witnesses. Applications can be mailed to the Vital Records office.' },
    { state: 'Arizona', wait: 'None', validity: '1 Year', notes: 'Requires 2 witnesses (age 18+). Covenant marriage is an optional, stricter legal track.' },
    { state: 'Arkansas', wait: 'None', validity: '60 Days', notes: 'No witnesses required. Returns must be filed within 15 days of the ceremony.' },
    { state: 'California', wait: 'None', validity: '90 Days', notes: 'Offers "Confidential" licenses (no witnesses required) vs "Public" (1 witness).' },
    { state: 'Colorado', wait: 'None', validity: '35 Days', notes: 'Self-Solemnization: You can legally marry yourselves without an officiant or witnesses.' },
    { state: 'Connecticut', wait: 'None', validity: '65 Days', notes: 'No witnesses required. No longer allows anyone under 18 to marry (as of 2025).' },
    { state: 'Delaware', wait: '24 Hours', validity: '30 Days', notes: '2 witnesses required. Waiting period is strictly enforced by time of day.' },
    { state: 'Florida', wait: '3 Days*', validity: '60 Days', notes: '*3-day wait for residents is waived if they complete a 4-hour premarital course.' },
    { state: 'Georgia', wait: 'None', validity: 'No Expiration', notes: 'Witnesses only required if the officiant doesn\'t have a standard seal/signature.' },
    { state: 'Hawaii', wait: 'None', validity: '30 Days', notes: 'No witnesses required. State-certified performers must be used.' },
    { state: 'Idaho', wait: 'None', validity: 'No Expiration', notes: 'No witnesses required. Both parties must provide Social Security numbers.' },
    { state: 'Illinois', wait: '1 Day', validity: '60 Days', notes: 'License only valid in the specific county where it was issued.' },
    { state: 'Indiana', wait: 'None', validity: '60 Days', notes: 'No witnesses required. Requires "Intent to Marry" filed with the Clerk of Circuit Court.' },
    { state: 'Iowa', wait: '3 Days', validity: 'No Expiration', notes: '1 witness required. Valid only in the state of Iowa.' },
    { state: 'Kansas', wait: '3 Days', validity: '6 Months', notes: '2 witnesses required (age 18+). Wait can be waived for a fee in emergencies.' },
    { state: 'Kentucky', wait: 'None', validity: '30 Days', notes: '2 witnesses required. License must be returned to the issuing county within 1 month.' },
    { state: 'Louisiana', wait: '24 Hours', validity: '30 Days', notes: '2 witnesses required. Offers Covenant Marriage options.' },
    { state: 'Maine', wait: 'None', validity: '90 Days', notes: '2 witnesses required. Residents apply in their town of residence; others in any town.' },
    { state: 'Maryland', wait: '48 Hours', validity: '6 Months', notes: 'No witnesses required. Non-residents must apply in the county of the ceremony.' },
    { state: 'Massachusetts', wait: '3 Days', validity: '60 Days', notes: 'One-day "Marriage Designation" allows a friend to officiate for a small fee.' },
    { state: 'Michigan', wait: '3 Days', validity: '33 Days', notes: '2 witnesses required (age 18+). License must be used in the county it was issued.' },
    { state: 'Minnesota', wait: 'None', validity: '6 Months', notes: '2 witnesses required (age 16+). Premarital education can reduce the license fee.' },
    { state: 'Mississippi', wait: 'None', validity: 'No Expiration', notes: 'No witnesses required. Still technically has laws regarding "blood kin" restrictions.' },
    { state: 'Missouri', wait: 'None', validity: '30 Days', notes: 'License can be used anywhere in the state. No witnesses required.' },
    { state: 'Montana', wait: 'None', validity: '180 Days', notes: 'No witnesses required. Allows for "Proxy Marriage" if one party is active military.' },
    { state: 'Nebraska', wait: 'None', validity: '1 Year', notes: '2 witnesses required. Minimum age to marry without parental consent is 19.' },
    { state: 'Nevada', wait: 'None', validity: '1 Year', notes: '1 witness required. The "Express" state; licenses are often issued instantly.' },
    { state: 'New Hampshire', wait: 'None', validity: '90 Days', notes: 'No witnesses required. Both parties must be 18 (no exceptions as of 2024).' },
    { state: 'New Jersey', wait: '72 Hours', validity: '30 Days', notes: '1 witness required. The 72-hour clock starts when the application is filed.' },
    { state: 'New Mexico', wait: 'None', validity: 'No Expiration', notes: '2 witnesses required. License must be returned within 90 days of the ceremony.' },
    { state: 'New York', wait: '24 Hours', validity: '60 Days', notes: '1 witness required. Waiting period can be waived by a judicial order.' },
    { state: 'North Carolina', wait: 'None', validity: '60 Days', notes: '2 witnesses required. Most counties allow for online application.' },
    { state: 'North Dakota', wait: 'None', validity: '60 Days', notes: '2 witnesses required. One witness can be a relative.' },
    { state: 'Ohio', wait: 'None', validity: '60 Days', notes: 'No witnesses required. License valid immediately upon issuance.' },
    { state: 'Oklahoma', wait: 'None', validity: '30 Days', notes: '2 witnesses required. 18+ to marry without consent.' },
    { state: 'Oregon', wait: '3 Days', validity: '60 Days', notes: '2 witnesses required (age 18+). Waiting period can be waived for a fee.' },
    { state: 'Pennsylvania', wait: '3 Days', validity: '60 Days', notes: 'No witnesses required. Quaker/Self-Uniting licenses are uniquely common here.' },
    { state: 'Rhode Island', wait: 'None', validity: '3 Months', notes: '2 witnesses required (age 18+). Women residents must apply in their town; men in theirs.' },
    { state: 'South Carolina', wait: '24 Hours', validity: 'No Expiration', notes: 'No witnesses required. One of the few states where cousins can legally marry.' },
    { state: 'South Dakota', wait: 'None', validity: '90 Days', notes: '1 witness required. No blood test or residency required.' },
    { state: 'Tennessee', wait: 'None', validity: '30 Days', notes: 'No witnesses required. Strict rules on online ordained ministers (often challenging validity).' },
    { state: 'Texas', wait: '72 Hours', validity: '90 Days', notes: 'No witnesses required. 72-hour wait is waived for active military.' },
    { state: 'Utah', wait: 'None', validity: '32 Days', notes: '2 witnesses required. Famous for allowing fully digital/remote weddings via Zoom (verified).' },
    { state: 'Vermont', wait: 'None', validity: '60 Days', notes: 'No witnesses required. License is valid for 60 days from issuance.' },
    { state: 'Virginia', wait: 'None', validity: '60 Days', notes: 'No witnesses required. The officiant must be authorized by a Virginia circuit court.' },
    { state: 'Washington', wait: '3 Days', validity: '60 Days', notes: '2 witnesses required. 3-day wait is strictly mandatory.' },
    { state: 'Washington D.C.', wait: 'None', validity: 'No Expiration', notes: 'No witnesses required. You can self-officiate.' },
    { state: 'West Virginia', wait: 'None', validity: '60 Days', notes: 'No witnesses required. No blood test.' },
    { state: 'Wisconsin', wait: '6 Days', validity: '30 Days', notes: '2 witnesses required. The 6-day wait can be waived for an extra fee.' },
    { state: 'Wyoming', wait: 'None', validity: '1 Year', notes: '2 witnesses required. Minimum age 18.' }
]

export default function MarriageLaws() {
    const [selectedState, setSelectedState] = useState('')

    const selectedLaw = marriageLaws.find(law => law.state === selectedState)

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span className="text-gray-400">Marriage Laws</span>
                    </div>
                    <h1 className="text-2xl font-serif text-gray-800">2026 US Marriage Laws</h1>
                    <p className="text-gray-500">Select a state to view legal requirements</p>
                </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="text-yellow-400 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong className="font-medium text-yellow-800">Important Disclaimer:</strong> Marriage laws are subject to local legislative changes.
                            Users should always confirm specific document requirements with the County Clerk.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card md:p-8">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center">
                        <label className="block text-lg font-medium text-gray-700 mb-3">Which state are you getting married in?</label>
                        <select
                            className="input-field text-lg py-3"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                        >
                            <option value="">Select a State...</option>
                            {marriageLaws.map(law => (
                                <option key={law.state} value={law.state}>{law.state}</option>
                            ))}
                        </select>
                    </div>

                    {selectedLaw ? (
                        <div className="bg-primary-50 rounded-2xl p-6 md:p-8 border border-primary-100 shadow-sm animate-fade-in text-center">
                            <h2 className="text-3xl font-serif text-primary-800 mb-6 border-b border-primary-200 pb-4">
                                {selectedLaw.state}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left">
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Waiting Period</p>
                                    <p className="text-xl font-medium text-gray-800">{selectedLaw.wait}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">License Validity</p>
                                    <p className="text-xl font-medium text-gray-800">{selectedLaw.validity}</p>
                                </div>
                            </div>

                            <div className="text-left bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Legal Details & Witnesses</p>
                                <p className="text-gray-700 leading-relaxed text-lg">{selectedLaw.notes}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <span className="text-4xl block mb-2">🗺️</span>
                            <p>Select a state above to see the laws</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
