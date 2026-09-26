/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExpertChatbot } from './components/ExpertChatbot';
import { EmergencyModal } from './components/EmergencyModal';

export default function App() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-2 sm:p-4 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Full-width dark chatbot experience */}
      <ExpertChatbot
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Emergency Red-Flag Warning Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
}
