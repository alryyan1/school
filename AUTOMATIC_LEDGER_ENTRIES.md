# Automatic Student Ledger Entries

This document explains how the system automatically creates student ledger entries when enrollments are created or updated.

## Overview

When a student is enrolled or when their enrollment details are modified, the system automatically creates corresponding entries in the student ledger to maintain accurate financial records.

## Automatic Entries Created

### 1. Enrollment Creation

When a new enrollment is created, the following ledger entries are automatically generated:

#### Fee Entry
- **Transaction Type**: `fee`
- **Description**: "رسوم التسجيل السنوية - {academic_year}"
- **Amount**: The enrollment fees amount
- **Reference Number**: `ENR-{enrollment_id}`
- **Metadata**: Includes enrollment details and auto-created flag

#### Discount Entry (if applicable)
- **Transaction Type**: `discount`
- **Description**: "خصم على رسوم التسجيل - {discount_percentage}% - {academic_year}"
- **Amount**: Calculated discount amount (fees × discount_percentage / 100)
- **Reference Number**: `ENR-DISC-{enrollment_id}`
- **Metadata**: Includes discount details and auto-created flag

### 2. Enrollment Updates

When an existing enrollment is updated, the system creates appropriate ledger entries:

#### Fee Changes
- **Fee Increase**: Creates a new `fee` entry for the increased amount
- **Fee Decrease**: Creates an `adjustment` entry with negative amount

#### Discount Changes
- **Old Discount Removal**: Creates an `adjustment` entry to reverse the old discount
- **New Discount Application**: Creates a new `discount` entry for the new discount

## Implementation Details

### Backend Changes

The automatic ledger entry creation is implemented in the `EnrollmentController`:

1. **Store Method**: Creates fee and discount entries when enrollment is created
2. **Update Method**: Creates entries when fees or discounts are modified

### Error Handling

- If ledger entry creation fails, the error is logged but doesn't prevent the enrollment operation
- This ensures that enrollment operations remain functional even if there are ledger system issues

### Database Structure

Ledger entries include:
- `enrollment_id`: Links to the enrollment
- `student_id`: Links to the student
- `transaction_type`: Type of transaction (fee, discount, adjustment, etc.)
- `description`: Human-readable description in Arabic
- `amount`: Transaction amount
- `balance_after`: Calculated balance after this transaction
- `reference_number`: Unique reference for tracking
- `metadata`: JSON data with additional context
- `created_by`: User who triggered the action
- `auto_created`: Flag indicating this was automatically generated

## Benefits

1. **Automatic Financial Tracking**: No need to manually create ledger entries
2. **Audit Trail**: Complete history of all fee changes and discounts
3. **Consistency**: Ensures all enrollments have corresponding ledger entries
4. **Transparency**: Clear tracking of fee modifications and their reasons

## Testing

The system includes comprehensive tests in `EnrollmentLedgerTest.php` that verify:
- Automatic fee entry creation
- Automatic discount entry creation
- Fee update handling
- Discount update handling
- School annual fees auto-fill functionality

## Usage Examples

### Creating an Enrollment
```php
// When you create an enrollment with fees=1000 and discount=20%
// The system automatically creates:
// 1. Fee entry: 1000 (transaction_type: 'fee')
// 2. Discount entry: 200 (transaction_type: 'discount')
```

### Updating Fees
```php
// When you update fees from 1000 to 1500
// The system automatically creates:
// 1. Fee entry: 500 (transaction_type: 'fee') for the increase
```

### Updating Discounts
```php
// When you update discount from 10% to 25%
// The system automatically creates:
// 1. Adjustment entry: -100 (transaction_type: 'adjustment') to reverse old discount
// 2. Discount entry: 250 (transaction_type: 'discount') for new discount
```

## Notes

- All automatic entries are marked with `auto_created: true` in metadata
- Reference numbers follow a consistent pattern for easy identification
- The system maintains proper balance calculations through the `StudentLedger::addEntry()` method
- Arabic descriptions are used for better user experience in the Arabic-speaking context
