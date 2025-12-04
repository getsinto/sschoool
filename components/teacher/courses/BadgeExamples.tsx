'use client'

/**
 * Example Usage File for Permission and Role Badge Components
 * 
 * This file demonstrates how to use the PermissionBadge and RoleBadge components
 * in various scenarios throughout the teacher interface.
 */

import { PermissionBadge, PermissionBadgeGroup, PermissionSummary } from './PermissionBadge'
import { RoleBadge, RoleWithPermissions, CompactRoleBadge } from './RoleBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BadgeExamples() {
  // Example permission data
  const fullPermissions = {
    can_manage_content: true,
    can_grade: true,
    can_communicate: true
  }
  
  const partialPermissions = {
    can_manage_content: true,
    can_grade: false,
    can_communicate: true
  }
  
  const limitedPermissions = {
    can_manage_content: false,
    can_grade: true,
    can_communicate: false
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Badge Component Examples</h1>
        <p className="text-gray-600">
          Demonstrations of PermissionBadge and RoleBadge components
        </p>
      </div>

      {/* Individual Permission Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Permission Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Granted Permissions</h3>
            <div className="flex flex-wrap gap-2">
              <PermissionBadge type="can_manage_content" granted={true} />
              <PermissionBadge type="can_grade" granted={true} />
              <PermissionBadge type="can_communicate" granted={true} />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Denied Permissions</h3>
            <div className="flex flex-wrap gap-2">
              <PermissionBadge type="can_manage_content" granted={false} />
              <PermissionBadge type="can_grade" granted={false} />
              <PermissionBadge type="can_communicate" granted={false} />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Different Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <PermissionBadge type="can_manage_content" granted={true} size="sm" />
              <PermissionBadge type="can_manage_content" granted={true} size="md" />
              <PermissionBadge type="can_manage_content" granted={true} size="lg" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Without Labels (Icon Only)</h3>
            <div className="flex flex-wrap gap-2">
              <PermissionBadge type="can_manage_content" granted={true} showLabel={false} />
              <PermissionBadge type="can_grade" granted={true} showLabel={false} />
              <PermissionBadge type="can_communicate" granted={false} showLabel={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Badge Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Badge Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Full Permissions</h3>
            <PermissionBadgeGroup permissions={fullPermissions} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Partial Permissions</h3>
            <PermissionBadgeGroup permissions={partialPermissions} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Limited Permissions</h3>
            <PermissionBadgeGroup permissions={limitedPermissions} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Vertical Layout</h3>
            <PermissionBadgeGroup permissions={partialPermissions} layout="vertical" />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Small Size, No Labels</h3>
            <PermissionBadgeGroup 
              permissions={fullPermissions} 
              showLabels={false}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Full Access</h3>
            <PermissionSummary permissions={fullPermissions} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Partial Access</h3>
            <PermissionSummary permissions={partialPermissions} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Limited Access</h3>
            <PermissionSummary permissions={limitedPermissions} />
          </div>
        </CardContent>
      </Card>

      {/* Role Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Role Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Different Roles</h3>
            <div className="flex flex-wrap gap-2">
              <RoleBadge role="primary" />
              <RoleBadge role="content_manager" />
              <RoleBadge role="grader" />
              <RoleBadge role="assistant" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Primary Teacher Override</h3>
            <div className="flex flex-wrap gap-2">
              <RoleBadge role="content_manager" isPrimaryTeacher={true} />
              <RoleBadge role="grader" isPrimaryTeacher={false} />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Different Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role="primary" size="sm" />
              <RoleBadge role="primary" size="md" />
              <RoleBadge role="primary" size="lg" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Without Icons</h3>
            <div className="flex flex-wrap gap-2">
              <RoleBadge role="primary" showIcon={false} />
              <RoleBadge role="content_manager" showIcon={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role with Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role with Permissions Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Primary Teacher</h3>
            <RoleWithPermissions 
              role="primary"
              isPrimaryTeacher={true}
              permissions={fullPermissions}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Content Manager</h3>
            <RoleWithPermissions 
              role="content_manager"
              isPrimaryTeacher={false}
              permissions={partialPermissions}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Grader</h3>
            <RoleWithPermissions 
              role="grader"
              isPrimaryTeacher={false}
              permissions={limitedPermissions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compact Role Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Compact Role Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Different Scenarios</h3>
            <div className="flex flex-wrap gap-2">
              <CompactRoleBadge isPrimaryTeacher={true} hasContentAccess={true} />
              <CompactRoleBadge isPrimaryTeacher={false} hasContentAccess={true} />
              <CompactRoleBadge isPrimaryTeacher={false} hasContentAccess={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage in Course Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Example: Course Card with Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Advanced Mathematics</h3>
                <p className="text-sm text-gray-600">Grade 10 • 45 Students</p>
              </div>
              <CompactRoleBadge isPrimaryTeacher={true} hasContentAccess={true} />
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-gray-700 mb-2">Your Permissions:</p>
              <PermissionBadgeGroup 
                permissions={fullPermissions}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * USAGE EXAMPLES IN REAL COMPONENTS:
 * 
 * 1. In Course List:
 * ```tsx
 * <CompactRoleBadge 
 *   isPrimaryTeacher={course.is_primary_teacher}
 *   hasContentAccess={course.can_manage_content}
 * />
 * ```
 * 
 * 2. In Course Detail Header:
 * ```tsx
 * <RoleWithPermissions 
 *   role={getUserRole(permissions)}
 *   isPrimaryTeacher={permissions.is_primary_teacher}
 *   permissions={permissions}
 * />
 * ```
 * 
 * 3. In Permission Settings:
 * ```tsx
 * <PermissionSummary permissions={userPermissions} />
 * ```
 * 
 * 4. In Quick Permission Check:
 * ```tsx
 * <PermissionBadge 
 *   type="can_manage_content" 
 *   granted={permissions.can_manage_content}
 *   size="sm"
 * />
 * ```
 */
