

// 'use client';
// import { useState } from 'react';
// import { 
//   ChevronDown, 
//   ChevronRight, 
//   Eye, 
//   Edit, 
//   Trash2,
//   Calendar,
//   FileText,
//   User,
//   CreditCard,
//   Check,
//   AlertTriangle
// } from 'lucide-react';
// import { Card } from '@/components/ui/card';

// export interface PaymentLine {
//   cashPaymentLineId: number;
//   accountCode: string;
//   accountName: string;
//   description?: string;
//   amount: number;
// }

// export interface Payment {
//   cashPaymentId: number;
//   voucherNo: number;
//   paymentDate: string;
//   jobDescription: string;
//   cashAccountCode: string;
//   cashAccountName: string;
//   totalAmount: number;
//   remarks?: string;
//   addedByUsername: string;
//   paymentLines?: PaymentLine[];
//   linesTotal?: number;
//   isBalanced?: boolean;
// }

// export interface PaymentCardProps {
//   payment: Payment;
//   onView?: (id: number) => void;
//   onEdit?: (id: number) => void;
//   onDelete?: (id: number) => void;
//   collapsed?: boolean;
// }

// export function PaymentCard({ 
//   payment, 
//   onView, 
//   onEdit, 
//   onDelete,
//   collapsed = false
// }: PaymentCardProps) {
//   const [isCollapsed, setIsCollapsed] = useState(collapsed);

//   const formatCurrency = (amount: number) => {
//     return `₨ ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateMobile = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       day: '2-digit',
//       month: 'short'
//     });
//   };

//   return (
//     <Card className="overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-2 hover:border-blue-200 transition-all duration-200">
//       {/* Header Section - Completely Redesigned for Mobile */}
//       <div className="p-2 sm:p-3">
//         {/* Top Row: Voucher, Description, Amount, Toggle */}
//         <div className="flex items-start gap-2">
//           {/* Left: Voucher Badge */}
//           <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
//             #{payment.voucherNo}
//           </span>

//           {/* Middle: Description & Date */}
//           <div className="flex-1 min-w-0">
//             <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
//               {payment.jobDescription || "Payment Voucher"}
//             </h3>
//             <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
//               <Calendar className="w-3 h-3" />
//               <span className="hidden sm:inline">{formatDate(payment.paymentDate)}</span>
//               <span className="sm:hidden">{formatDateMobile(payment.paymentDate)}</span>
//             </div>
//           </div>

//           {/* Right: Amount & Toggle */}
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             <div className="text-right">
//               <div className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
//                 {formatCurrency(payment.totalAmount)}
//               </div>
//             </div>
//             <button
//               onClick={() => setIsCollapsed(!isCollapsed)}
//               className="p-1 hover:bg-blue-100/50 rounded-full text-blue-700 transition-colors"
//               title={isCollapsed ? "Expand" : "Collapse"}
//             >
//               {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>

//         {/* Bottom Row: Account Info & Actions */}
//         <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
//           {/* Left: Account & Meta Info */}
//           <div className="flex items-center gap-2 text-xs text-gray-600 overflow-x-auto flex-1 min-w-0">
//             <div className="flex items-center gap-1 flex-shrink-0">
//               <CreditCard className="w-3 h-3 text-blue-600" />
//               <span className="truncate max-w-[100px] sm:max-w-[180px]">
//                 {payment.cashAccountCode}
//               </span>
//             </div>
//             <span className="text-gray-400">•</span>
//             <div className="flex items-center gap-1 flex-shrink-0">
//               <FileText className="w-3 h-3 text-purple-600" />
//               <span>{payment.paymentLines?.length || 0}</span>
//             </div>
//             <span className="hidden sm:inline text-gray-400">•</span>
//             <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
//               <User className="w-3 h-3 text-emerald-600" />
//               <span className="truncate max-w-[100px]">{payment.addedByUsername}</span>
//             </div>
//           </div>

//           {/* Right: Action Buttons */}
//           <div className="flex items-center gap-0.5 flex-shrink-0">
//             {onView && (
//               <button
//                 onClick={() => onView(payment.cashPaymentId)}
//                 className="p-1.5 hover:bg-blue-100/50 rounded-lg text-blue-600 transition-colors"
//                 title="View"
//               >
//                 <Eye className="w-3.5 h-3.5" />
//               </button>
//             )}
//             {onEdit && (
//               <button
//                 onClick={() => onEdit(payment.cashPaymentId)}
//                 className="p-1.5 hover:bg-purple-100/50 rounded-lg text-purple-600 transition-colors"
//                 title="Edit"
//               >
//                 <Edit className="w-3.5 h-3.5" />
//               </button>
//             )}
//             {onDelete && (
//               <button
//                 onClick={() => onDelete(payment.cashPaymentId)}
//                 className="p-1.5 hover:bg-red-100/50 rounded-lg text-red-600 transition-colors"
//                 title="Delete"
//               >
//                 <Trash2 className="w-3.5 h-3.5" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Expanded Content */}
//       {!isCollapsed && payment.paymentLines && (
//         <div className="border-t border-blue-100 bg-white/80">
//           <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
//             {payment.paymentLines.map((line) => (
//               <div 
//                 key={line.cashPaymentLineId} 
//                 className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:border-emerald-200 transition-colors"
//               >
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-baseline gap-1.5">
//                       <span className="font-medium text-gray-900 text-xs sm:text-sm">
//                         {line.accountCode}
//                       </span>
//                       <span className="text-gray-600 text-xs sm:text-sm truncate">
//                         {line.accountName}
//                       </span>
//                     </div>
//                     {line.description && (
//                       <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
//                         {line.description}
//                       </div>
//                     )}
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <div className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
//                       {formatCurrency(line.amount)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Summary Footer */}
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 border-t border-gray-100">
//               <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
//                 <div className="text-xs sm:text-sm text-gray-600">
//                   Total: <span className="font-semibold">{formatCurrency(payment.linesTotal || 0)}</span>
//                 </div>
//                 {payment.isBalanced !== undefined && (
//                   <div className={`flex items-center gap-1 text-xs sm:text-sm ${
//                     payment.isBalanced ? 'text-emerald-600' : 'text-red-600'
//                   }`}>
//                     {payment.isBalanced ? (
//                       <>
//                         <Check className="w-3.5 h-3.5" />
//                         <span>Balanced</span>
//                       </>
//                     ) : (
//                       <>
//                         <AlertTriangle className="w-3.5 h-3.5" />
//                         <span>Unbalanced</span>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Card>
//   );
// }


'use client';
import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  FileText,
  User,
  CreditCard,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface PaymentLine {
  cashPaymentLineId: number;
  accountCode: string;
  accountName: string;
  description?: string;
  amount: number;
}

export interface Payment {
  cashPaymentId: number;
  voucherNo: number;
  paymentDate: string;
  jobDescription: string;
  cashAccountCode: string;
  cashAccountName: string;
  totalAmount: number;
  remarks?: string;
  addedByUsername: string;
  paymentLines?: PaymentLine[];
  linesTotal?: number;
  isBalanced?: boolean;
}

export interface PaymentCardProps {
  payment: Payment;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  collapsed?: boolean;
}

export function PaymentCard({ 
  payment, 
  onView, 
  onEdit, 
  onDelete,
  collapsed = false
}: PaymentCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const formatCurrency = (amount: number) => {
    return `₨ ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-2 hover:border-blue-200 transition-all duration-200">
      {/* Header Section - Completely Redesigned for Mobile */}
      <div className="p-1 sm:p-3">
        {/* Top Row: Voucher, Description, Amount, Toggle */}
        <div className="flex items-start gap-2">
          {/* Left: Voucher Badge */}
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
            #{payment.voucherNo}
          </span>

          {/* Middle: Description & Date */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
              {payment.jobDescription || "Payment Voucher"}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">{formatDate(payment.paymentDate)}</span>
              <span className="sm:hidden">{formatDateMobile(payment.paymentDate)}</span>
            </div>
          </div>

          {/* Right: Amount & Toggle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
                {formatCurrency(payment.totalAmount)}
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-blue-100/50 rounded-full text-blue-700 transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Account Info & Actions */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
          {/* Left: Account & Meta Info */}
          <div className="flex items-center gap-2 text-xs text-gray-600 overflow-x-auto flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <CreditCard className="w-3 h-3 text-blue-600" />
              <span className="truncate max-w-[100px] sm:max-w-[180px]">
                {payment.cashAccountName}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FileText className="w-3 h-3 text-purple-600" />
              <span>{payment.paymentLines?.length || 0}</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <User className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[100px]">{payment.addedByUsername}</span>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onView && (
              <button
                onClick={() => onView(payment.cashPaymentId)}
                className="p-1.5 hover:bg-blue-100/50 rounded-lg text-blue-600 transition-colors"
                title="View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(payment.cashPaymentId)}
                className="p-1.5 hover:bg-purple-100/50 rounded-lg text-purple-600 transition-colors"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(payment.cashPaymentId)}
                className="p-1.5 hover:bg-red-100/50 rounded-lg text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && payment.paymentLines && (
        <div className="border-t border-blue-100 bg-white/80">
          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            {payment.paymentLines.map((line) => (
              <div 
                key={line.cashPaymentLineId} 
                className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">
                        {line.accountCode}
                      </span>
                      <span className="text-gray-600 text-xs sm:text-sm truncate">
                        {line.accountName}
                      </span>
                    </div>
                    {line.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {line.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                      {formatCurrency(line.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary Footer */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-600">
                  Total: <span className="font-semibold">{formatCurrency(payment.linesTotal || 0)}</span>
                </div>
                {payment.isBalanced !== undefined && (
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                    payment.isBalanced ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {payment.isBalanced ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Balanced</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Unbalanced</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}