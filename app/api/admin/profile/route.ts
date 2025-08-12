
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    console.log('Profile update request:', { 
      name, 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword,
      userEmail: session.user.email
    });

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.email);

    // Prepare update data
    const updateData: any = {};
    let hasChanges = false;
    
    // Update name if provided and different
    if (name && name.trim() !== '' && name !== user.name) {
      updateData.name = name.trim();
      hasChanges = true;
      console.log('Name will be updated to:', name);
    }

    // Handle password update
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword || currentPassword.trim() === '') {
        console.log('Current password is required but not provided');
        return NextResponse.json({ 
          error: 'Current password is required to change password' 
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ 
          error: 'New password must be at least 6 characters long' 
        }, { status: 400 });
      }

      console.log('Verifying current password...');
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      console.log('Password verification result:', isValidPassword);
      
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'Current password is incorrect' 
        }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
      hasChanges = true;
      console.log('Password will be updated');
    }

    console.log('Update data keys:', Object.keys(updateData), 'hasChanges:', hasChanges);

    // Update user if there are changes
    if (hasChanges) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          updatedAt: true
        }
      });

      console.log('User updated successfully:', updatedUser.email);

      const message = Object.keys(updateData).includes('password') 
        ? 'Profile and password updated successfully'
        : 'Profile updated successfully';

      return NextResponse.json({
        success: true,
        message,
        user: updatedUser
      });
    } else {
      return NextResponse.json({ 
        success: true,
        message: 'No changes to update' 
      });
    }

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile. Please try again.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
