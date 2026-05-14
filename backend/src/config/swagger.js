const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Banking API',
            version: '1.0.0',
            description: 'A comprehensive banking API with authentication, loans, transactions, and AI-powered features',
            contact: {
                name: 'API Support',
                email: 'support@aibanking.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server'
            },
            {
                url: 'https://api.aibanking.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authentication token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        name: {
                            type: 'string',
                            description: 'User full name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        phone: {
                            type: 'string',
                            description: 'User phone number'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'User role'
                        },
                        email_verified: {
                            type: 'boolean',
                            description: 'Email verification status'
                        },
                        profile_completed: {
                            type: 'boolean',
                            description: 'Profile completion status'
                        },
                        pin_set: {
                            type: 'boolean',
                            description: 'Transaction PIN setup status'
                        },
                        kyc_status: {
                            type: 'string',
                            enum: ['pending', 'verified', 'rejected'],
                            description: 'KYC verification status'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            description: 'User password'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'phone', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'User full name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        phone: {
                            type: 'string',
                            minLength: 10,
                            description: 'User phone number'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            description: 'User password'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description: 'JWT authentication token'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        msg: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        msg: {
                            type: 'string',
                            description: 'Success message'
                        }
                    }
                },
                LoanRequest: {
                    type: 'object',
                    required: ['amount', 'purpose', 'duration'],
                    properties: {
                        amount: {
                            type: 'number',
                            minimum: 100,
                            description: 'Loan amount'
                        },
                        purpose: {
                            type: 'string',
                            description: 'Loan purpose'
                        },
                        duration: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Loan duration in months'
                        }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Transaction ID'
                        },
                        user_id: {
                            type: 'string',
                            description: 'User ID who created the transaction'
                        },
                        type: {
                            type: 'string',
                            enum: ['deposit', 'withdraw', 'transfer', 'payment'],
                            description: 'Transaction type'
                        },
                        amount: {
                            type: 'number',
                            description: 'Transaction amount'
                        },
                        description: {
                            type: 'string',
                            description: 'Transaction description'
                        },
                        reference_number: {
                            type: 'string',
                            description: 'Unique transaction reference number'
                        },
                        recipient_account_number: {
                            type: 'string',
                            description: 'Recipient account number'
                        },
                        recipient_name: {
                            type: 'string',
                            description: 'Recipient name'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed'],
                            description: 'Transaction status'
                        },
                        balance_before: {
                            type: 'number',
                            description: 'Account balance before transaction'
                        },
                        balance_after: {
                            type: 'number',
                            description: 'Account balance after transaction'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Transaction creation timestamp'
                        }
                    }
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Payment ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        payment_type: {
                            type: 'string',
                            description: 'Payment type'
                        },
                        provider: {
                            type: 'string',
                            description: 'Payment provider'
                        },
                        provider_reference: {
                            type: 'string',
                            description: 'Provider payment reference'
                        },
                        account_or_phone: {
                            type: 'string',
                            description: 'Receiver account number or phone for the payment'
                        },
                        amount: {
                            type: 'number',
                            description: 'Payment amount'
                        },
                        currency: {
                            type: 'string',
                            example: 'RWF',
                            description: 'Currency code'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
                            description: 'Payment status'
                        },
                        description: {
                            type: 'string',
                            description: 'Payment description'
                        },
                        transaction_reference: {
                            type: 'string',
                            description: 'Reference number for the associated transaction'
                        },
                        balance_before: {
                            type: 'number',
                            description: 'User balance before the payment'
                        },
                        balance_after: {
                            type: 'number',
                            description: 'User balance after the payment'
                        },
                        paid_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp when payment was marked completed'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Payment creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Payment last update timestamp'
                        }
                    }
                },
                Account: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Account ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        balance: {
                            type: 'number',
                            description: 'Account balance'
                        },
                        currency: {
                            type: 'string',
                            example: 'RWF',
                            description: 'Currency code'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Loan: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Loan ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        amount: {
                            type: 'number',
                            description: 'Loan amount'
                        },
                        purpose: {
                            type: 'string',
                            description: 'Loan purpose'
                        },
                        duration: {
                            type: 'integer',
                            description: 'Duration in months'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected'],
                            description: 'Loan status'
                        },
                        risk_score: {
                            type: 'number',
                            description: 'AI calculated risk score'
                        },
                        ai_decision: {
                            type: 'object',
                            description: 'AI decision details'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Insight: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Insight ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        message: {
                            type: 'string',
                            description: 'Insight message'
                        },
                        type: {
                            type: 'string',
                            enum: ['risk', 'investment', 'alert', 'recommendation'],
                            description: 'Insight type'
                        },
                        is_read: {
                            type: 'boolean',
                            description: 'Whether insight has been read'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                KYCDocument: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Document ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        document_type: {
                            type: 'string',
                            enum: ['national_id', 'selfie', 'passport', 'driving_license'],
                            description: 'Type of document'
                        },
                        upload_status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected'],
                            description: 'Upload status'
                        },
                        uploaded_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            }
        }
    },
    apis: [
        './src/routes/auth.routes.js',
        './src/routes/public.routes.js', 
        './src/routes/profile.routes.js',
        './src/routes/payment.routes.js',
        './src/routes/loan.routes.js',
        './src/routes/transaction.routes.js',
        './src/routes/account.routes.js',
        './src/routes/insights.routes.js',
        './src/routes/kyc.routes.js',
        './src/routes/security.routes.js',
        './src/routes/otp.routes.js'
    ], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
