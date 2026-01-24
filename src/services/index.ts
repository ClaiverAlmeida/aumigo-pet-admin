// 🚀 SERVIÇO CENTRALIZADO DE API
export { api } from './api.service';
export type { ApiResponse, ApiOptions } from './api.service';

// 🔐 SERVIÇOS DE AUTENTICAÇÃO
export { authService, AuthService } from './auth.service';
export type { AuthUser, AuthState } from './auth.service';
export { getUserFromToken } from './jwt';

// 🆔 SERVIÇO DE KYC
export { kycDocumentsService, KycDocumentsService } from './kyc-documents.service';
export type { KycDocument, ProfessionalProfile, CreateKycDocumentDto, UpdateKycDocumentDto } from './kyc-documents.service';

// 🏢 SERVIÇO DE SERVICE PROVIDERS
export { serviceProvidersService, ServiceProvidersService } from './service-providers.service';
export type { ServiceProvider } from './service-providers.service';

// 📁 SERVIÇO DE FILES
export { filesService, FilesService } from './files.service';
export type { File, UploadFileResponse } from './files.service';

// 🕐 SERVIÇO DE OPENING HOURS
export { openingHoursService, OpeningHoursService } from './opening-hours.service';
export type { TimeSlot, DayAvailability, WeeklyAvailability, UpdateOpeningHoursDto } from './opening-hours.service';

// 🏢 SERVIÇO DE COMPANIES
export { companiesService, CompaniesService } from './companies.service';
export type { Company, UpdateCompanyData } from './companies.service';

// 👤 SERVIÇO DE USERS
export { usersService, UsersService } from './users.service';
export type { User } from './users.service';

// 📅 SERVIÇO DE BOOKINGS
export { bookingsService, BookingsService } from './bookings.service';
export type { Booking, BookingStatus, UpdateBookingData } from './bookings.service';
